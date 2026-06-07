FROM nginx:alpine

# Esto elimina la pantalla de bienvenida por defecto de Nginx
RUN rm /etc/nginx/conf.d/default.conf

# Esto copia tu configuración real del balanceador al lugar correcto
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80