/* eslint camelcase:0 */
'use strict';
const Generator = require('yeoman-generator');
const chalk = require('chalk');
const yosay = require('yosay');
const { execSync } = require('child_process');

// Todo: Is there a better yeoman specific way to do this?
const getGitName = () => {
  let gitNames;
  try {
    // Todo: I should probably re-write the grep and sed bits to use JavaScript as this will be more portable
    gitNames = execSync(
      `git config -l | grep -E '^(user.name|user.email)' | sed 's/user..*=//g' | head -2`
    ).toString();
    gitNames = gitNames.split('\n');
  } catch (err) {
    gitNames = ['', ''];
  }
  let userName = gitNames[0];
  let userEmail = '';
  if (gitNames[1].length > 0) {
    userEmail = `<${gitNames[1]}>`;
  }

  return `${userName} ${userEmail}`;
};

/*
 * Returns a string consisting of '"somestring"' or "'somestring'" preferring the former over the later
 */
const cleanString = str => {
  if (str.startsWith("'") || str.startsWith('"')) {
    const char = str[0];
    if (str.slice(-1) !== char) {
      str += char;
    }
  } else {
    const char = str.slice(-1);
    if (char !== "'" && char !== '"') {
      str = '"' + str + '"';
    } else {
      str = char + str;
    }
  }

  return str;
};

const cleanArray = (str, stringify) => {
  if (stringify) {
    // Remove leading and ending brackets to simplify logic
    // We'll add these back later...
    if (str[0] === '(') {
      str[0] = '';
    }
    if (str[str.length - 1] === ')') {
      str[str.length - 1] = '';
    }

    str = str.split(' ');

    for (let i = 0; i < str.length; i++) {
      str[i] = cleanString(str[i]);

      // Remove empty strings
      if (str[i].length === 2) {
        str[i] = '';
      }
    }
    str = str.join(' ');
  }

  if (str[0] !== '(') {
    str = '(' + str;
  }

  if (str.slice(-1) !== ')') {
    str += ')';
  }

  return str;
};

module.exports = class extends Generator {
  constructor(args, opts) {
    super(args, opts);

    this.argument('pkgname', { desc: 'Package Name', type: String, required: false });

    this.option('yes', {
      desc: 'Use default options',
      alias: 'y',
      type: Boolean,
      default: false
    });
    this.option('update-remote', {
      desc:
        "Force updating of the git remote. By default we won't touch your existing git remote. This option forces an update",
      default: false
    });
    this.option('package-type', {
      desc: `Package Type:
\t[pyton] Python/Python2 split package
\t[empty] Default PKGBUILD with supplied options\n\t`,
      type: String,
      default: 'empty'
    });
    this.option('with-docker', {
      desc: 'Add support for building packages with Docker',
      type: Boolean,
      default: false
    });
    this.option('with-chroot', {
      desc:
        'Add support for building packages via makechrootpkg (takes precedence over --with-docker in the generated Makefile)',
      type: Boolean,
      default: false
    });
    this.option('rtfw', {
      desc:
        'Adds support for reading the f*****g wiki (opens the Arch Wiki page for PKGBUILD)',
      type: Boolean,
      default: false
    });
  }

  prompting() {
    if (this.options.rtfw === true) {
      const rtfw = 'https://wiki.archlinux.org/index.php/PKGBUILD';
      const hasBrowser = (() => {
        return typeof process.env.BROWSER === 'string';
      })();
      // Respect the BROWSER environment variable
      if (hasBrowser) {
        execSync(`${process.env.BROWSER} "${rtfw}"`);
        process.exit(0);
      } else {
        switch (process.platform) {
          case 'darwin':
            execSync(`open "${rtfw}"`);
            break;
          case 'win32':
            execSync(`explorer "${rtfw}"`);
            break;
          case 'linux':
          case 'freebsd':
          default: {
            const hasXDGOpen = (() => {
              try {
                execSync('xdg-open --version');
                return true;
              } catch (err) {
                return false;
              }
            })();
            if (hasXDGOpen) {
              execSync(`xdg-open "${rtfw}"`);
            }
            break;
          }
        }
      }
    }
    // Have Yeoman greet the user.
    this.log(
      yosay(
        'Welcome to the awe-inspiring ' + chalk.red('generator-pkgbuild') + ' generator!'
      )
    );

    const prompts = [
      {
        type: 'input',
        name: 'name',
        message: 'Name',
        default: this.options.pkgname || this.appname
      },
      {
        type: 'input',
        name: 'description',
        message: 'Description',
        default: ''
      },
      {
        type: 'input',
        name: 'url',
        message: 'URL',
        default: 'http://example.org'
      },
      {
        type: 'input',
        name: 'maintainer',
        message: 'Maintainer',
        default: getGitName()
      },
      {
        type: 'input',
        name: 'arch',
        message: 'Supported Architectures',
        default: () => {
          switch (process.arch) {
            case 'armv7':
            case 'armv7h':
            case 'arm32':
              return 'armv7h';
            case 'armv6':
            case 'armv6h':
              return 'armv6h';
            case 'armv8':
            case 'arm64v8':
            case 'arm64':
              return 'aarch64';
            case 'arm':
              return 'arm';
            case 'i686':
            case 'ia32':
              return 'i686';
            case 'x64':
            default:
              return 'x86_64';
          }
        }
      },
      {
        type: 'input',
        name: 'pkgver',
        message: 'Package Version',
        default: '0.0.0'
      },
      {
        type: 'input',
        name: 'license',
        message: 'License',
        default: 'GPL'
      },
      {
        type: 'input',
        name: 'depends',
        message: 'Dependencies',
        default: ''
      },
      {
        type: 'input',
        name: 'makedepends',
        message: 'Make Dependencies',
        default: ''
      }
    ];

    switch (this.options['package-type']) {
      case 'python':
        prompts[
          prompts.findIndex(e => {
            return e.name === 'makedepends';
          })
        ].default =
          'python python2 python-setuptools python2-setuptools';
        break;
      default:
        break;
    }

    let func;
    if (this.options.yes === true) {
      func = defaults => {
        let obj = {};
        return new Promise(resolve => {
          for (let i = 0; i < defaults.length; i++) {
            obj[defaults[i].name] = defaults[i].default;
            if (obj[defaults[i].name] instanceof Function) {
              obj[defaults[i].name] = obj[defaults[i].name]();
            }
          }

          return resolve(obj);
        });
      };
    }
    return (typeof func === 'undefined'
      ? this.prompt(prompts)
      : func(prompts)
    ).then(props => {
      switch (this.options['package-type']) {
        case 'python':
          props.build = `	cp -r python-${props.name} python2-${props.name}

	cd python-${props.name}
	python ./setup.py build

	cd ../python2-${props.name}
	python2 ./setup.py build`;
          props.package = `package_python-${props.name}() {
	depends=${props.depends}

	cd python-${props.name}

	python setup.py install --root="$pkgdir" --optimize=1
}

package_python2-${props.name}() {
	depends=${props.depends.replace('python', 'python2')}

	cd python2-${props.name}

	python2 setup.py install --root="$pkgdir" --optimize=1
}`;
          props.pkgname = `('python-${props.name}' 'python2-${props.name}')`;
          props.check = `check_python-${props.name}() {
	return 0
}

check_python2-${props.name}() {
	return 0;
}`;
        // eslint-disable-next-line no-fallthrough
        default:
          if (!props.pkgname) {
            props.pkgname = props.name;
          }
          if (!props.build) {
            props.build = `	#cd "$pkgname-$pkgver"
	#./configure --prefix=/usr
	#make
	return 0`;
          }
          if (props.name.endsWith('-git')) {
            props.pkgverfunc = `	cd "\${srcdir}/${props.name}"
	printf "r%s.%s" "$(git rev-list --count HEAD)" "$(git rev-parse --short HEAD)"`;
          } else {
            props.pkgverfunc = `	printf "%s" "$pkgver"`;
          }
          if (!props.check) {
            props.check = `check() {
	#cd "${props.name}"
	#make -k check
	return 0
}`;
          }
          if (!props.package) {
            props.package = `package() {
	#cd "$pkgname-$pkgver"
	#make DESTDIR="$pkgdir/" install
	return 0
}`;
          }
          break;
      }
      // To access props later use this.props.someAnswer;
      this.props = props;
    });
  }

  writing() {
    Object.keys(this.props).forEach(prop => {
      switch (prop) {
        case 'description':
        case 'url':
          this.props[prop] = cleanString(this.props[prop]);
          break;
        case 'arch':
        case 'license':
        case 'depends':
        case 'makedepends':
          this.props[prop] = cleanArray(this.props[prop], true);
          break;
        default:
          break;
      }
    });

    this.fs.copyTpl(
      this.templatePath('PKGBUILD.proto'),
      this.destinationPath(`${this.props.name}/PKGBUILD`),
      this.props
    );

    if (this.options['with-docker'] === true || this.options['with-chroot'] === true) {
      let makefile_build_target;
      if (this.options['with-docker'] && this.options['with-chroot']) {
        makefile_build_target = 'chroot-build';
      } else {
        makefile_build_target = this.options['with-docker']
          ? 'docker-build'
          : 'chroot-build';
      }

      let makefile_docker_target = '';
      let makefile_chroot_target = '';

      if (this.options['with-docker'] === true) {
        makefile_docker_target = this.fs.read(this.templatePath('Makefile-docker'));
        this.fs.copy(
          this.templatePath('Dockerfile'),
          this.destinationPath(`${this.props.name}/Dockerfile`)
        );
        this.fs.copy(
          this.templatePath('docker-entrypoint.sh'),
          this.destinationPath(`${this.props.name}/docker-entrypoint.sh`)
        );
      }

      if (this.options['with-chroot'] === true) {
        makefile_chroot_target = this.fs.read(this.templatePath('Makefile-chroot'));
        this.fs.copy(
          this.templatePath('arch-pkgbuild-chroot.sh'),
          this.destinationPath(`${this.props.name}/arch-pkgbuild-chroot.sh`)
        );
      }

      this.fs.copyTpl(
        this.templatePath('Makefile'),
        this.destinationPath(`${this.props.name}/Makefile`),
        { makefile_build_target, makefile_chroot_target, makefile_docker_target }
      );

      this.fs.copy(
        this.templatePath('.gitignore'),
        this.destinationPath(`${this.props.name}/.gitignore`)
      );
    }

    const hasGit = (() => {
      try {
        execSync('git --version');
        return true;
      } catch (err) {
        return false;
      }
    })();

    if (hasGit) {
      // Todo: Is there a better way to init a git repo?
      if (!require('fs').existsSync(`./${this.props.name}/.git`)) {
        this.spawnCommand('mkdir', [this.props.name], { stdio: null });
        console.log(execSync(`cd ${this.props.name} && git init`).toString());
      }
      // Add AUR git remote if there isn't already a remote set
      const gitRemote = execSync(`cd ${this.props.name} && git remote -v`).toString();

      const updateGitRemote = remote => {
        let _remote = remote;
        if (this.options['package-type'] === 'python') {
          _remote = `python-${_remote}`;
        }
        console.log(
          execSync(
            `cd ${remote} && git remote add origin ssh://aur@aur.archlinux.org/${_remote}.git`
          ).toString()
        );
      };

      const removeGitRemote = remote => {
        console.log(execSync(`cd ${remote} && git remote rm origin`).toString());
      };

      if (gitRemote.length === 0) {
        updateGitRemote(this.props.name);
      } else if (!this.options.yes) {
        this.prompt([
          {
            type: 'confirm',
            name: 'updateremote',
            message: 'A git remote is already set, would you like us to update it?'
          }
        ]).then(answer => {
          if (answer.updateremote === true) {
            removeGitRemote(this.props.name);
            updateGitRemote(this.props.name);
          }
        });
      } else if (this.options['update-remote'] === true) {
        removeGitRemote(this.props.name);
        updateGitRemote(this.props.name);
      }
    }
  }
};
