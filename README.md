# generator-pkgbuild [![NPM version][npm-image]][npm-url] [![Build Status][travis-image]][travis-url] [![Dependency Status][daviddm-image]][daviddm-url]
> Arch Linux PKGBUILD generator - Because [Arch is the best](https://wiki.archlinux.org/index.php/Arch_is_the_best)

## Installation

First, install [Yeoman](http://yeoman.io) and generator-pkgbuild using [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com) (we assume you have pre-installed [node.js](https://nodejs.org/)).

### Npm

```bash
npm install -g yo
npm install -g generator-pkgbuild
```

### Yarn

```bash
yarn global add yo
yarn global add generator-pkgbuild
```

Then generate your new project:

```bash
yo pkgbuild
```

## Usage

```bash
Usage:
  yo pkgbuild:app [options] [<pkgname>]

Options:
  -h,   --help           # Print the generator's options and usage
        --skip-cache     # Do not remember prompt answers                                                                                       Default: false
        --skip-install   # Do not automatically install dependencies                                                                            Default: false
  -y,   --yes            # Use default options                                                                                                  Default: false
        --update-remote  # Force updating of the git remote. By default we won't touch your existing git remote. This option forces an update   Default: false
        --package-type   # Package Type:
        [pyton] Python/Python2 split package
        [empty] Default PKGBUILD with supplied options
                        Default: empty
        --with-docker    # Add support for building packages with Docker                                                                        Default: false
        --with-chroot    # Add support for building packages via makechrootpkg (takes precedence over --with-docker in the generated Makefile)  Default: false
        --rtfw           # Adds support for reading the f*****g wiki (opens the Arch Wiki page for PKGBUILD)                                    Default: false

Arguments:
  pkgname  # Package Name  Type: String  Required: false
```

[npm-image]: https://badge.fury.io/js/generator-pkgbuild.svg
[npm-url]: https://npmjs.org/package/generator-pkgbuild
[travis-image]: https://travis-ci.org/aidanharris/generator-pkgbuild.svg?branch=master
[travis-url]: https://travis-ci.org/aidanharris/generator-pkgbuild
[daviddm-image]: https://david-dm.org/aidanharris/generator-pkgbuild.svg?theme=shields.io
[daviddm-url]: https://david-dm.org/aidanharris/generator-pkgbuild
