#!/usr/bin/env bash
set -e

usage() {
  # shellcheck disable=SC2016
  printf "Usage:\n\t%s\n" 'docker run -it --rm -v "$PWD:$PWD" -w "$PWD" -e UID="$UID" IMAGE_NAME'
}

if [ -z "$UID" ] || [ "$UID" -eq 0 ]
then
  echo "Don't run me as root..."
  usage
  exit 1
fi

if [ "$PWD" = "/" ]
then
  # shellcheck disable=SC2016
  echo 'Set the working directory to $PWD'
  usage
  exit 1
fi

pacman -Syu --noconfirm
pacman -S --needed --noconfirm base-devel sudo git
useradd builduser -d "$PWD" -u "$UID" -U
passwd -d builduser
printf 'builduser ALL=(ALL) ALL\n' | tee -a /etc/sudoers

if [ "$1" = "shell" ]
then
  exec sudo -u builduser bash
else
  exec sudo -u builduser bash -c 'cd ~ && makepkg -s --noconfirm'
fi
