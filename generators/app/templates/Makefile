all: build
build: <%- makefile_build_target %>
shell: <%- makefile_shell_target %>
pkg:
	makepkg -fscC
<%- makefile_chroot_target %>
<%- makefile_docker_target %>

