function normalizeCompanyName(name) {
    if (!name) return '';
    const s = name.toLowerCase().trim();
    if (/jpmorgan|jpm\s|jpmc/.test(s)) return 'JPMC';
    if (/uravu/.test(s)) return 'Uravu Labs';
    if (/tech\s*mahindra/.test(s)) return 'Tech Mahindra';
    if (/amazon/.test(s)) return 'Amazon';
    if (/drdo/.test(s)) return 'DRDO';
    if (/aicte|nitttr/.test(s)) return 'NITTTR Chandigarh';
    return name.trim(); // fallback to original name if no match
  }
  module.exports = { normalizeCompanyName };
  