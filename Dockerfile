FROM node
MAINTAINER Jon Richter <post@jonrichter.de>

RUN mkdir /src && mkdir /data
WORKDIR /src
RUN git clone https://github.com/hackers4peace/plp-provider.git
WORKDIR /src/plp-provider
RUN cp config.example.js config.js && \
  sed -i 's/data/\/data/' config.js
RUN npm install
EXPOSE 5000
VOLUME /data
CMD ["npm", "start"]
