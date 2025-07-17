# Use Debian stable slim as the base image
FROM debian:stable-slim

# Expose port 9000 for the service
EXPOSE 9000

RUN apt-get update
RUN apt-get install --no-install-recommends -y \
	apt-utils \
	apt-transport-https \
	ca-certificates \
	libopenjp2-7-dev \
	libtiff-dev \
	libjpeg-dev \
	zlib1g-dev \
	libfcgi-dev \
	libwebp-dev \
	libpng-dev \
	git \
	autoconf \
	automake \
	libtool \
	pkg-config \
	g++ \
	make \
	libmemcached-dev \
    libgdk-pixbuf2.0-dev \
    libglib2.0-dev \
    libsqlite3-dev \
    libxml2-dev \
	libvips-dev \
    cmake

# Setup build directory
RUN mkdir /src && \
    chgrp -R 0 /src && \
    chmod -R g=u /src
	
COPY iipsrv /src/iipsrv

# OpenJPEG
WORKDIR /src
RUN git clone --depth=1 https://github.com/uclouvain/openjpeg.git --branch=v2.5.0
RUN mkdir /src/openjpeg/build
WORKDIR /src/openjpeg/build
RUN cmake -DBUILD_JPIP=ON -DBUILD_SHARED_LIBS=ON -DCMAKE_BUILD_TYPE=Release -DBUILD_CODEC=ON -DBUILD_PKGCONFIG_FILES=ON ../
RUN make
RUN make install

### OpenSlide
WORKDIR /src
RUN git clone --depth=1 https://github.com/openslide/openslide.git --branch=v3.4.1
WORKDIR /src/openslide
RUN autoreconf -i
RUN ./configure
RUN make
RUN make install

# FastCGI application
WORKDIR /src/iipsrv
RUN ./autogen.sh && \
    ./configure && \
    make && \
    cp src/iipsrv.fcgi /usr/local/bin/iipsrv

# Ensure any file created in the container is accessible to the root group
RUN chmod g=u /etc/passwd

# Set permissions for iipsrv and its dependencies
RUN chgrp -R 0 /usr/local/bin/iipsrv /src/openjpeg/build /src/openslide /src/iipsrv && \
    chmod -R g=u /usr/local/bin/iipsrv /src/openjpeg/build /src/openslide /src/iipsrv

# Create startup script which starts both lighttpd and iipsrv
RUN echo "#!/bin/sh" > /usr/local/bin/run && \
    echo "iipsrv --bind \${HOST}:\${PORT}" >> /usr/local/bin/run && \
    chmod +x /usr/local/bin/run && \
    chgrp 0 /usr/local/bin/run && \
    chmod g=u /usr/local/bin/run

# Set iipsrv environment defaults and execute startup script for vsb and im2
ENV HOST="0.0.0.0" PORT="9000" LOGFILE="/tmp/iipsrv.log" URI_MAP="iiif=>IIIF" VERBOSITY=6 FILESYSTEM_PREFIX="/root/src/images/"

ENTRYPOINT ["/usr/local/bin/run"]