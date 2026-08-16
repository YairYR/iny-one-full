import '@testing-library/jest-dom'

// Los tests ejercitan a propósito rutas de error que registran avisos. Silenciar
// el logger por defecto mantiene el reporte legible; el test del propio logger
// sube el nivel localmente.
process.env.LOG_LEVEL = 'silent'
