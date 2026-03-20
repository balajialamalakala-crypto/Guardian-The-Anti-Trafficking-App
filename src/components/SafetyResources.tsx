import React, { useState, useEffect } from 'react';
import { Shield, AlertCircle, Phone, BookOpen, ChevronRight, ExternalLink, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';

const DEFAULT_RESOURCES = [
  {
    id: 'signs',
    title: 'Recognizing the Signs',
    category: 'signs',
    icon: 'AlertCircle',
    color: 'amber',
    content: `
### Common Indicators of Human Trafficking

Human trafficking is often hidden in plain sight. Look for these signs:

- **Physical Signs**: Signs of physical abuse, malnourishment, or poor hygiene.
- **Behavioral Signs**: Fearful, anxious, submissive, or avoids eye contact.
- **Restricted Movement**: Rarely alone, monitored by someone else, or lacks identification documents.
- **Living Conditions**: Living in overcrowded or substandard housing provided by an employer.
- **Inconsistent Stories**: Providing scripted or rehearsed answers to questions.

*If you suspect something, do not intervene directly. Report it.*
    `
  },
  {
    id: 'safety',
    title: 'Personal Safety Tips',
    category: 'safety',
    icon: 'Shield',
    color: 'emerald',
    content: `
### How to Stay Safe

Protect yourself and your community with these actionable tips:

1. **Trust Your Instincts**: If a situation feels wrong, it probably is. Leave immediately if possible.
2. **Share Your Location**: Always let a trusted friend or family member know where you are.
3. **Be Wary of "Too Good to Be True" Offers**: High-paying jobs with no experience or free travel can be traps.
4. **Keep Documents Safe**: Never give your passport or ID to an employer or anyone you don't trust.
5. **Learn Local Hotlines**: Save emergency numbers in your phone under a discreet name.
    `
  },
  {
    id: 'hotlines',
    title: 'Emergency Hotlines',
    category: 'hotlines',
    icon: 'Phone',
    color: 'blue',
    content: `
### Immediate Help

If you or someone you know is in immediate danger, call local emergency services (911 in the US).

- **National Human Trafficking Hotline (USA)**: 1-888-373-7888
- **Text HELP to 233733 (BeFree)**
- **International Justice Mission (IJM)**: [ijm.org](https://www.ijm.org)
- **Polaris Project**: [polarisproject.org](https://polarisproject.org)

*These services are confidential and available 24/7.*
    `
  }
];

export default function SafetyResources() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [resources, setResources] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'resources'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (snapshot.empty) {
        setResources(DEFAULT_RESOURCES);
      } else {
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setResources(data);
      }
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'resources');
      setResources(DEFAULT_RESOURCES);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 size={32} className="animate-spin text-zinc-400" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
          <BookOpen size={24} />
        </div>
        <div>
          <h2 className="text-xl font-bold text-zinc-900 tracking-tight">Safety Resources</h2>
          <p className="text-sm text-zinc-500">Learn how to protect yourself and others.</p>
        </div>
      </div>

      <div className="grid gap-4">
        {resources.map((resource) => {
          const IconMap: any = { Shield, AlertCircle, Phone };
          const Icon = IconMap[resource.icon] || BookOpen;
          const isSelected = selectedId === resource.id;
          
          const colorMap: any = {
            amber: 'bg-amber-50 text-amber-600 border-amber-100',
            emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
            blue: 'bg-blue-50 text-blue-600 border-blue-100',
          };
          const colorClass = colorMap[resource.color] || 'bg-zinc-50 text-zinc-600 border-zinc-100';

          return (
            <motion.div
              key={resource.id}
              layout
              className="bg-white rounded-3xl border border-zinc-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
            >
              <button
                onClick={() => setSelectedId(isSelected ? null : resource.id)}
                className="w-full p-6 flex items-center justify-between text-left"
              >
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-2xl border ${colorClass}`}>
                    <Icon size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-zinc-900 tracking-tight">{resource.title}</h3>
                    <span className="text-xs font-medium uppercase tracking-wider text-zinc-400">
                      {resource.category}
                    </span>
                  </div>
                </div>
                <ChevronRight 
                  size={20} 
                  className={cn(
                    "text-zinc-400 transition-transform duration-300",
                    isSelected && "rotate-90"
                  )} 
                />
              </button>

              <AnimatePresence>
                {isSelected && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="px-6 pb-6"
                  >
                    <div className="pt-4 border-t border-zinc-100 prose prose-zinc prose-sm max-w-none">
                      <ReactMarkdown
                        components={{
                          h3: ({ children }) => <h3 className="text-lg font-bold text-zinc-900 mt-4 mb-2">{children}</h3>,
                          p: ({ children }) => <p className="text-zinc-600 leading-relaxed mb-4">{children}</p>,
                          ul: ({ children }) => <ul className="list-disc list-inside space-y-2 mb-4 text-zinc-600">{children}</ul>,
                          li: ({ children }) => <li className="text-zinc-600">{children}</li>,
                          a: ({ children, href }) => (
                            <a 
                              href={href} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-600 font-semibold inline-flex items-center gap-1 hover:underline"
                            >
                              {children} <ExternalLink size={12} />
                            </a>
                          ),
                        }}
                      >
                        {resource.content}
                      </ReactMarkdown>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}
