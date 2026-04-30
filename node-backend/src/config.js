import dotenv from 'dotenv';
dotenv.config();

const config = {
    PORT: parseInt(process.env.PORT, 10) || 3001,
    SECRET_KEY: process.env.SECRET_KEY || 'dev-secret-key-insecure',
    IS_PRODUCTION: process.env.IS_PRODUCTION === 'true',
    ALGORITHM: 'HS256',
    ACCESS_TOKEN_EXPIRE_MINUTES: parseInt(process.env.ACCESS_TOKEN_EXPIRE_MINUTES, 10) || 1440, // 24 hours
};

export default config;
