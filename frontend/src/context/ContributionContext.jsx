import { createContext, useContext, useState } from 'react';

const ContributionContext = createContext();

export const ContributionProvider = ({ children }) => {
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [wizardTarget, setWizardTarget] = useState(null); // What are we contributing to?

  const openWizard = (target) => {
    setWizardTarget(target);
    setIsWizardOpen(true);
  };

  const closeWizard = () => {
    setIsWizardOpen(false);
    setWizardTarget(null);
  };

  return (
    <ContributionContext.Provider value={{ isWizardOpen, wizardTarget, openWizard, closeWizard }}>
      {children}
    </ContributionContext.Provider>
  );
};

export const useContribution = () => useContext(ContributionContext);