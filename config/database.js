// Les variables d'environnement dans .env seront prioritaires, mais cette configuration sert de base.
module.exports = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '', 
    //En retirant la chaîne de caractères réelle et en laissant une valeur par défaut vide (''), 
    // nous forçons l'application à dépendre du fichier .env pour le mot de passe.
    database: process.env.DB_NAME || 'hair_appointment'
};