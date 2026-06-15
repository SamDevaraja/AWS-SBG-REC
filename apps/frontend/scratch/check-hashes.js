const bcrypt = require('bcryptjs');

const coreHash = '$2b$10$irkLMUug.ZbE1MrcqAIyWOFfaoe/eSLwuCX/AW69ah/8PS3sjYDmm';
const crewHash = '$2b$10$R/VEClBn.A5G/iHNqPKVsuAQgMQZGw7AeiuGBxQBYLr/ORUGIEvjK';

async function check() {
  console.log("Core match 'pranav123':", await bcrypt.compare('pranav123', coreHash));
  console.log("Crew match 'sam123':", await bcrypt.compare('sam123', crewHash));
}

check();
