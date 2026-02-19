/**
 * Configuração compartilhada para conexão MongoDB.
 * Use MONGODB_URI no .env (ex: mongodb://localhost:27017/nest).
 */
export function getMongoUri(): string {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('MONGODB_URI is not set');
  }
  return uri;
}
