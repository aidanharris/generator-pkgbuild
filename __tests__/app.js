'use strict';
var path = require('path');
var assert = require('yeoman-assert');
var helpers = require('yeoman-test');

describe('generator-pkgbuild:pkg', () => {
  beforeAll(() => {
    return helpers
      .run(path.join(__dirname, '../generators/app'))
      .withArguments(['pkg'])
      .withPrompts({ yes: true });
  });

  it('creates PKGBUILD', () => {
    assert.file(['pkg/PKGBUILD']);
  });

  it('initialises git repo', () => {
    assert.file(['pkg/.git']);
  });
});
