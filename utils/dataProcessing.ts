import { Message, UserProfile } from '../types';

export const calculateUrgency = (text: string): number => {
  let score = 10; // Base score
  const lowerText = text.toLowerCase();

  // High Urgency Keywords
  if (lowerText.includes('reject')) score += 50;
  if (lowerText.includes('disburs')) score += 40;
  if (lowerText.includes('money')) score += 30;
  if (lowerText.includes('urgent')) score += 30;
  if (lowerText.includes('wait')) score += 20;
  if (lowerText.includes('clear')) score += 20; // Clearance
  if (lowerText.includes('crb')) score += 40; // Credit Bureau is stressful
  if (lowerText.includes('fraud') || lowerText.includes('used my i.d')) score += 80;

  return Math.min(score, 100);
};

export const parseCSV = (csvText: string): Message[] => {
  const lines = csvText.trim().split('\n');
  const messages: Message[] = [];
  
  // Skip header (index 0)
  for (let i = 1; i < lines.length; i++) {
    // Basic CSV regex to handle quoted commas
    const row = lines[i].match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g);
    // Simple split fallback if regex fails on complex cases, but for this data simpler is okay
    // Actually, let's use a simpler split strategy assuming standard formatting
    // Note: The provided data has some quotes.
    
    // Quick and dirty CSV parser for the specific format provided
    let line = lines[i];
    const parts = [];
    let current = '';
    let inQuote = false;
    
    for (let char of line) {
        if (char === '"') {
            inQuote = !inQuote;
        } else if (char === ',' && !inQuote) {
            parts.push(current);
            current = '';
        } else {
            current += char;
        }
    }
    parts.push(current);

    if (parts.length >= 3) {
      const userId = parts[0].trim();
      const timestamp = parts[1].trim();
      // Remove surrounding quotes if present
      const body = parts.slice(2).join(',').trim().replace(/^"(.*)"$/, '$1');

      // Unique ID generation based on index
      messages.push({
        id: `msg_${i}`,
        userId,
        timestamp, // Keep as string for display, or parse to Date
        body,
        direction: 'inbound',
        urgencyScore: calculateUrgency(body),
        isRead: false,
        status: 'open'
      });
    }
  }
  return messages.sort((a, b) => b.urgencyScore - a.urgencyScore); // Initial sort by urgency
};

export const generateMockProfile = (userId: string): UserProfile => {
  // Deterministic mock generation based on ID
  const idNum = parseInt(userId) || 0;
  const risks: ('Low' | 'Medium' | 'High')[] = ['Low', 'Low', 'Medium', 'Medium', 'High'];
  
  return {
    userId,
    name: `Customer ${userId}`,
    phoneNumber: `07${(idNum * 1234).toString().slice(0, 8).padEnd(8, '0')}`,
    loanBalance: (idNum * 13) % 50000,
    creditScore: 300 + (idNum % 550),
    riskTier: risks[idNum % risks.length],
    lastInteraction: '2017-01-30',
  };
};
