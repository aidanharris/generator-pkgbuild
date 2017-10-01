FROM base/archlinux

ADD docker-entrypoint.sh /usr/bin/entrypoint

RUN chmod +x /usr/bin/entrypoint && \
    pacman -Syu --noconfirm && \
    pacman -S --needed --noconfirm \
      base-devel \
      sudo \
      git

CMD /usr/bin/entrypoint
