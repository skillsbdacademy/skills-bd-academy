const mongoose = require('mongoose');

const uri = "mongodb+srv://skillsbd:whh8mAAP0LK1VRbx@skillsbd-cluster.ofvscqb.mongodb.net/skillsbdacademy";

console.log('Connecting...');

mongoose.connect(uri)
  .then(() => {
    console.log('✅ Connected!');
    process.exit(0);
  })
  .catch((err) => {
    console.log('❌ Error:', err.message);
    console.log('Error Code:', err.code);
    process.exit(1);
  });