#!/bin/sh

if [ -z "$SUDO_USER" ]
then
  printf "Usage:\n\tsudo %s \n\t\t[build]\t Build package\n\t\t[shell]\t Root shell in chroot\n" "$(basename $0)"
  exit 0
fi

# Set to 1 to enable using a ramcache
RAMCACHE=0
# Ramcache destination
RAMCACHE_DRIVE="/mnt/ramcache"
# Ramcache size (if using RAM)
RAMCACHE_SIZE=16g
# Set to zero for a disk based cache
RAMCACHE_USERAM=1

# This configures a ramcache utilitsing ccache
# To use it set RAMCACHE to "1" and change '!ccache' to 'ccache' in /etc/makepkg.conf
if [ "$RAMCACHE" -eq 1 ]
then
  if ! mount | grep -q "$RAMCACHE_DRIVE"
  then
    sudo mkdir -p "$RAMCACHE_DRIVE" || exit 1
    if [ "$RAMCACHE_USERAM" -eq 1 ]
    then
      sudo mount -t tmpfs -o size=$RAMCACHE_SIZE tmpfs "$RAMCACHE_DRIVE" || exit 1
    fi
    sudo mkdir -p "$RAMCACHE_DRIVE/ccache" || exit 1
    sudo chown -R "$SUDO_USER":"$SUDO_USER" "$RAMCACHE_DRIVE/ccache" || exit 1
  fi
fi

if [ -z "$CHROOT" ]
then
  export CHROOT=$HOME/../chroot
fi

sudo mkdir -p "$CHROOT"

# Copies your current systems pacman configuration
copyPacmanConf() {
  sudo rm -rf "$CHROOT/root/etc/pacman"*
  sudo cp -R /etc/pacman* "$CHROOT/root/etc/"
}

if [ ! -d "$CHROOT/root" ]
then
  sudo mkarchroot "$CHROOT/root" base base-devel sudo git curl wget jq
  copyPacmanConf
else
  copyPacmanConf
  sudo arch-nspawn "$CHROOT/root" pacman -Syu --noconfirm
fi

if [ "$1" = "shell" ]
then
  sudo arch-nspawn "$CHROOT/root" bash
fi

if [ "$1" = "build" ]
then
  if [ "$RAMCACHE" -eq 1 ]
  then
    makechrootpkg -c -d /mnt/ramcache/ccache:/ccache -r "$CHROOT" -- CCACHE_DIR=/ccache
  else
    makechrootpkg -c -r "$CHROOT"
  fi
fi
