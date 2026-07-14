
// AI features are currently disabled in the UI.
// This service is stubbed to prevent build and runtime errors.

export const suggestProductConcept = async (productName: string, category: string): Promise<{ concept: string; colourScheme: string }> => {
  return { concept: "", colourScheme: "" };
};
