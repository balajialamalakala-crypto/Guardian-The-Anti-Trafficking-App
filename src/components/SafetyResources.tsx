import React, { useState, useEffect } from 'react';
import { Shield, AlertCircle, Phone, BookOpen, ChevronRight, ExternalLink, Loader2, Heart, Scale, Home, Stethoscope } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';

const DEFAULT_RESOURCES = [
  {
    id: 'survivor-support',
    title: 'Survivor Support & Healing',
    category: 'support',
    icon: 'Heart',
    color: 'rose',
    content: `
### You are not alone.

Healing is a journey, and there are people ready to walk with you.

- **Emotional Support**: It's okay to feel overwhelmed. Professional counseling can help you process your experiences.
- **Safe Spaces**: There are organizations dedicated to providing secure housing and basic needs.
- **Empowerment**: You have the right to make choices about your life and future.

*Your strength is your own. We are here to support your path to freedom.*
    `
  },
  {
    id: 'legal-aid',
    title: 'Legal Rights & Assistance',
    category: 'legal',
    icon: 'Scale',
    color: 'blue',
    content: `
### Your Legal Rights

Regardless of your immigration status, you have rights.

1. **Right to Protection**: You have the right to be protected from your traffickers.
2. **Right to Legal Counsel**: You can access lawyers who specialize in trafficking cases.
3. **T-Visas and U-Visas**: In the US, there are specific visas for victims of trafficking and crime.
4. **Confidentiality**: Your information is protected by law when seeking help.

*Contact a legal aid organization to understand your specific options.*
    `
  },
  {
    id: 'medical-help',
    title: 'Medical & Health Services',
    category: 'medical',
    icon: 'Stethoscope',
    color: 'emerald',
    content: `
### Accessing Healthcare

Your health is a priority. Many clinics offer free or low-cost services for survivors.

- **Physical Health**: Treatment for injuries, chronic conditions, and general wellness.
- **Mental Health**: Specialized trauma therapy and support groups.
- **Reproductive Health**: Confidential screenings and care.
- **Substance Use Support**: Compassionate care for those struggling with addiction.

*You can receive medical care without fear of judgment or legal repercussions.*
    `
  },
  {
    id: 'safe-houses',
    title: 'Emergency Housing & Shelters',
    category: 'housing',
    icon: 'Home',
    color: 'amber',
    content: `
### Finding a Safe Place to Stay

If you need to leave a dangerous situation immediately, there are safe houses available.

- **Emergency Shelters**: Short-term housing for immediate safety.
- **Transitional Housing**: Longer-term support to help you get back on your feet.
- **Confidential Locations**: Many safe houses keep their addresses private to ensure your security.

*Call the National Human Trafficking Hotline (1-888-373-7888) to find a safe house near you.*
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
          <h2 className="text-xl font-bold text-zinc-900 tracking-tight">Support Resources</h2>
          <p className="text-sm text-zinc-500">Confidential help for your journey to safety.</p>
        </div>
      </div>

      <div className="grid gap-4">
        {resources.map((resource) => {
          const IconMap: any = { Shield, AlertCircle, Phone, Heart, Scale, Home, Stethoscope };
          const Icon = IconMap[resource.icon] || BookOpen;
          const isSelected = selectedId === resource.id;
          
          const colorMap: any = {
            amber: 'bg-amber-50 text-amber-600 border-amber-100',
            emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
            blue: 'bg-blue-50 text-blue-600 border-blue-100',
            rose: 'bg-rose-50 text-rose-600 border-rose-100',
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
