import { useState } from 'react';
import { X, ArrowRight, CheckCircle2, ShieldCheck } from 'lucide-react';
import { useContribution } from '../../context/ContributionContext';
import Button from '../common/Button';
import VerificationChip from '../common/VerificationChip';

export default function ContributionWizard() {
  const { isWizardOpen, wizardTarget, closeWizard } = useContribution();
  const [step, setStep] = useState(1);
  const [newContent, setNewContent] = useState('');

  if (!isWizardOpen) return null;

  const handleNext = () => setStep(2);
  const handleSubmit = () => {
    setStep(3); // success state
    setTimeout(() => {
      closeWizard();
      setStep(1);
      setNewContent('');
    }, 2000);
  };

  const getTargetTitle = () => {
    if (!wizardTarget) return 'Contribute Knowledge';
    return `Evolve: ${wizardTarget.location} ${wizardTarget.type}`;
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 sm:p-8 animate-fade-in-up">
      <div className="w-full max-w-5xl bg-white dark:bg-charcoal-900 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-charcoal-800 bg-gray-50/50 dark:bg-charcoal-800/20">
          <div>
            <h2 className="font-serif text-2xl font-bold text-charcoal-900 dark:text-gray-100">
              Knowledge Evolution
            </h2>
            <p className="text-sm text-charcoal-600 dark:text-gray-400">{getTargetTitle()}</p>
          </div>
          <button onClick={closeWizard} className="p-2 hover:bg-gray-200 dark:hover:bg-charcoal-700 rounded-full transition-colors">
            <X className="text-charcoal-500 dark:text-gray-400" />
          </button>
        </div>

        {/* State Markers */}
        <div className="flex items-center justify-center py-4 border-b border-gray-100 dark:border-charcoal-800">
          <div className="flex items-center gap-4 text-sm font-medium">
            <span className={step >= 1 ? "text-gold-600 dark:text-gold-400" : "text-gray-400"}>Current State</span>
            <ArrowRight size={16} className={step >= 2 ? "text-gold-600 dark:text-gold-400" : "text-gray-300"} />
            <span className={step >= 2 ? "text-gold-600 dark:text-gold-400" : "text-gray-400"}>Draft Evolution</span>
            <ArrowRight size={16} className={step >= 3 ? "text-gold-600 dark:text-gold-400" : "text-gray-300"} />
            <span className={step >= 3 ? "text-green-600 dark:text-green-400" : "text-gray-400"}>Verification</span>
          </div>
        </div>

        {/* Split Screen Content */}
        <div className="flex-1 overflow-y-auto flex flex-col md:flex-row tour-evolution-form">
          {/* Left: Current State */}
          <div className="flex-1 p-6 md:p-8 border-b md:border-b-0 md:border-r border-gray-200 dark:border-charcoal-800 bg-gray-50 dark:bg-charcoal-900/50">
            <h3 className="text-sm font-bold uppercase tracking-wider text-charcoal-500 dark:text-gray-500 mb-4">Current Information</h3>
            <div className="p-4 bg-white dark:bg-charcoal-800 rounded-lg border border-gray-200 dark:border-charcoal-700">
              <p className="text-charcoal-800 dark:text-gray-200 leading-relaxed mb-4">
                "Strong coverage in lobby. Occasional drops on the 3rd floor."
              </p>
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500">Last evolved: Oct 2023</span>
                <VerificationChip count={42} isVerified={true} />
              </div>
            </div>
            
            <div className="mt-8">
              <h4 className="text-sm font-semibold text-charcoal-700 dark:text-gray-400 mb-3 flex items-center gap-2">
                <ShieldCheck size={16} className="text-gold-500" /> Top Contributor for this node
              </h4>
              <div className="flex items-center gap-2 p-2 rounded bg-white dark:bg-charcoal-800 border border-gray-100 dark:border-charcoal-700">
                <div className="w-6 h-6 rounded-full bg-gold-500 text-white flex items-center justify-center text-xs font-bold">J</div>
                <span className="text-sm font-medium text-charcoal-800 dark:text-gray-200">@StudentJohn</span>
                <span className="ml-auto text-xs bg-gold-100 text-gold-800 dark:bg-gold-900/30 dark:text-gold-400 px-2 py-0.5 rounded">Rank 42 Helix</span>
              </div>
            </div>
          </div>

          {/* Right: New Contribution */}
          <div className="flex-1 p-6 md:p-8 bg-white dark:bg-charcoal-900">
             <h3 className="text-sm font-bold uppercase tracking-wider text-gold-600 dark:text-gold-400 mb-4">Propose Evolution</h3>
             
             {step === 1 && (
               <div className="flex flex-col h-full animate-fade-in-up">
                 <label className="block text-sm font-medium text-charcoal-700 dark:text-gray-300 mb-2">
                   What has changed?
                 </label>
                 <textarea
                   value={newContent}
                   onChange={(e) => setNewContent(e.target.value)}
                   className="w-full flex-1 min-h-[150px] p-4 bg-gray-50 dark:bg-charcoal-800 border border-gray-300 dark:border-charcoal-600 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-gold-500 resize-none text-charcoal-900 dark:text-gray-100 transition-colors"
                   placeholder="E.g., The 3rd floor routers were replaced last week, coverage is excellent now."
                 />
                 <div className="mt-6 flex justify-end">
                   <Button onClick={handleNext} disabled={!newContent.trim()}>Continue to Review</Button>
                 </div>
               </div>
             )}

             {step === 2 && (
               <div className="flex flex-col h-full animate-fade-in-up">
                 <div className="p-4 bg-gold-50 dark:bg-gold-900/20 border border-gold-200 dark:border-gold-800 rounded-lg mb-6">
                   <h4 className="text-sm font-semibold text-gold-800 dark:text-gold-400 mb-2">Review your proposal</h4>
                   <p className="text-charcoal-800 dark:text-gray-200">
                     {newContent}
                   </p>
                 </div>
                 
                 <div className="text-sm text-charcoal-600 dark:text-gray-400 mb-6 flex items-start gap-2">
                   <ShieldCheck size={18} className="text-gold-500 shrink-0 mt-0.5" />
                   <p>Your contribution will be marked as "Unverified" until it receives 3 upvotes from other students. Submitting accurate data increases your Helix rank.</p>
                 </div>

                 <div className="mt-auto flex justify-between">
                   <Button variant="secondary" onClick={() => setStep(1)}>Edit</Button>
                   <Button onClick={handleSubmit}>Submit Evolution</Button>
                 </div>
               </div>
             )}

             {step === 3 && (
               <div className="flex flex-col h-full items-center justify-center text-center animate-fade-in-up">
                 <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-4">
                   <CheckCircle2 size={32} className="text-green-600 dark:text-green-400" />
                 </div>
                 <h3 className="text-xl font-bold text-charcoal-900 dark:text-gray-100 mb-2">Evolution Submitted!</h3>
                 <p className="text-charcoal-600 dark:text-gray-400">
                   Your knowledge has been added to the Genome and is pending verification.
                 </p>
               </div>
             )}
          </div>
        </div>
      </div>
    </div>
  );
}
