import dotenv from 'dotenv';
dotenv.config();
const { ZAMMAD_TOKEN: zammad_token } = process.env;
export const ticketIdPattern = /^ticket\d+$|^\d{5,}$/;
export const API = 'http://localhost:8080';
export const ZAMMAD_API = 'https://zammad.login.no/api/v1';
export const ZAMMAD_TOKEN = zammad_token;
