// back/models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Définition du schéma pour le modèle Utilisateur
const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Le nom est requis'],
  },
  email: {
    type: String,
    required: [true, 'L\'email est requis'],
    unique: true,
    match: [/.+\@.+\..+/, 'Veuillez entrer un email valide'],
  },
  password: {
    type: String,
    required: [true, 'Le mot de passe est requis'],
    minlength: 6,
    select: false, // Ne pas renvoyer le mot de passe par défaut lors des requêtes
  },
  role: {
    type: String,
    enum: ['client', 'admin', 'utilisateur-employer'],
    default: 'client',
  },
  employeeCode: {
    type: String,
    unique: true,
    sparse: true // Permet d'avoir des valeurs null tout en gardant l'unicité
  },
  balance: {
    type: Number,
    default: 0,
  },

  // ────────────────────────────── OTP / CODES EN PAUSE ──────────────────────────────
  // signupCode: { type: String },
  // signupCodeExpires: { type: Date },
  // resetCode: { type: String },
  // resetCodeExpires: { type: Date },
  // otpCode: { type: String },
  // otpExpires: { type: Date },
  // ────────────────────────────────────────────────────────────────────────────────

  isActive: { 
    type: Boolean, 
    default: true      // ← forcé à true pour bypass la vérification email temporairement
    // default: false  // ← ancienne valeur (commentée)
  },
}, {
  timestamps: true, // Ajoute automatiquement les champs createdAt et updatedAt
});

// Middleware Mongoose pour hacher le mot de passe avant de sauvegarder l'utilisateur
UserSchema.pre('save', async function (next) {
  // Ne hache le mot de passe que s'il a été modifié (ou est nouveau)
  if (!this.isModified('password')) {
    return next();
  }
  
  // Générer un "salt" pour renforcer le hachage
  const salt = await bcrypt.genSalt(10);
  // Hacher le mot de passe avec le salt
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Méthode pour comparer le mot de passe entré avec celui dans la base de données
UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Méthode pour générer un code employé unique
UserSchema.statics.generateEmployeeCode = async function(name, email) {
  // Extraire 3 caractères du nom (en majuscules)
  const nameChars = name.replace(/[^a-zA-Z]/g, '').toUpperCase().slice(0, 3);
  
  // Extraire 2 caractères de l'email (avant le @)
  const emailChars = email.split('@')[0].slice(0, 2).toUpperCase();
  
  // Générer 4 chiffres aléatoires
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  
  // Combiner pour former le code
  const baseCode = `${nameChars}${emailChars}${randomNum}`;
  
  // Vérifier si le code existe déjà
  let codeExists = await this.findOne({ employeeCode: baseCode });
  if (!codeExists) {
    return baseCode;
  }
  
  // Si le code existe, ajouter un suffixe jusqu'à trouver un code unique
  let counter = 1;
  while (codeExists) {
    const newCode = `${baseCode}-${counter}`;
    codeExists = await this.findOne({ employeeCode: newCode });
    if (!codeExists) {
      return newCode;
    }
    counter++;
  }
};

// Création du modèle 'User' à partir du schéma
const User = mongoose.model('User', UserSchema);

module.exports = User;