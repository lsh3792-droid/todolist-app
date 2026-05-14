import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';

const root = resolve(__dirname, '../../');

describe('FE-01: 프론트엔드 프로젝트 초기 설정', () => {
  describe('필수 파일 존재 확인', () => {
    it('package.json이 존재한다', () => {
      expect(existsSync(resolve(root, 'package.json'))).toBe(true);
    });

    it('tsconfig.json이 존재한다', () => {
      expect(existsSync(resolve(root, 'tsconfig.json'))).toBe(true);
    });

    it('tsconfig.app.json이 존재한다', () => {
      expect(existsSync(resolve(root, 'tsconfig.app.json'))).toBe(true);
    });

    it('vite.config.ts가 존재한다', () => {
      expect(existsSync(resolve(root, 'vite.config.ts'))).toBe(true);
    });

    it('.eslintrc.cjs가 존재한다', () => {
      expect(existsSync(resolve(root, '.eslintrc.cjs'))).toBe(true);
    });

    it('.prettierrc가 존재한다', () => {
      expect(existsSync(resolve(root, '.prettierrc'))).toBe(true);
    });

    it('.env.development가 존재한다', () => {
      expect(existsSync(resolve(root, '.env.development'))).toBe(true);
    });

    it('.env.example이 존재한다', () => {
      expect(existsSync(resolve(root, '.env.example'))).toBe(true);
    });

    it('.gitignore가 존재한다', () => {
      expect(existsSync(resolve(root, '.gitignore'))).toBe(true);
    });

    it('index.html이 존재한다', () => {
      expect(existsSync(resolve(root, 'index.html'))).toBe(true);
    });

    it('src/main.tsx가 존재한다', () => {
      expect(existsSync(resolve(root, 'src/main.tsx'))).toBe(true);
    });

    it('src/vite-env.d.ts가 존재한다', () => {
      expect(existsSync(resolve(root, 'src/vite-env.d.ts'))).toBe(true);
    });
  });

  describe('package.json 의존성 확인', () => {
    const pkg = JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf-8'));

    it('react 의존성이 있다', () => {
      expect(pkg.dependencies).toHaveProperty('react');
    });

    it('react-dom 의존성이 있다', () => {
      expect(pkg.dependencies).toHaveProperty('react-dom');
    });

    it('react-router-dom 의존성이 있다', () => {
      expect(pkg.dependencies).toHaveProperty('react-router-dom');
    });

    it('zustand 의존성이 있다', () => {
      expect(pkg.dependencies).toHaveProperty('zustand');
    });

    it('@tanstack/react-query 의존성이 있다', () => {
      expect(pkg.dependencies).toHaveProperty('@tanstack/react-query');
    });

    it('axios 의존성이 있다', () => {
      expect(pkg.dependencies).toHaveProperty('axios');
    });

    it('vitest 개발 의존성이 있다', () => {
      expect(pkg.devDependencies).toHaveProperty('vitest');
    });

    it('@testing-library/react 개발 의존성이 있다', () => {
      expect(pkg.devDependencies).toHaveProperty('@testing-library/react');
    });

    it('eslint 개발 의존성이 있다', () => {
      expect(pkg.devDependencies).toHaveProperty('eslint');
    });

    it('prettier 개발 의존성이 있다', () => {
      expect(pkg.devDependencies).toHaveProperty('prettier');
    });

    it('@typescript-eslint/eslint-plugin 개발 의존성이 있다', () => {
      expect(pkg.devDependencies).toHaveProperty('@typescript-eslint/eslint-plugin');
    });

    it('dev 스크립트가 있다', () => {
      expect(pkg.scripts).toHaveProperty('dev');
    });

    it('build 스크립트가 있다', () => {
      expect(pkg.scripts).toHaveProperty('build');
    });

    it('test 스크립트가 있다', () => {
      expect(pkg.scripts).toHaveProperty('test');
    });
  });

  describe('tsconfig 설정 확인', () => {
    const tsconfig = JSON.parse(readFileSync(resolve(root, 'tsconfig.app.json'), 'utf-8'));

    it('strict 옵션이 true다', () => {
      expect(tsconfig.compilerOptions.strict).toBe(true);
    });

    it('jsx 설정이 있다', () => {
      expect(tsconfig.compilerOptions.jsx).toBeDefined();
    });
  });

  describe('.env 파일 내용 확인', () => {
    it('.env.development에 VITE_API_BASE_URL이 있다', () => {
      const content = readFileSync(resolve(root, '.env.development'), 'utf-8');
      expect(content).toContain('VITE_API_BASE_URL=http://localhost:3000');
    });

    it('.env.example에 VITE_API_BASE_URL이 있다', () => {
      const content = readFileSync(resolve(root, '.env.example'), 'utf-8');
      expect(content).toContain('VITE_API_BASE_URL');
    });
  });

  describe('.prettierrc 설정 확인', () => {
    const prettier = JSON.parse(readFileSync(resolve(root, '.prettierrc'), 'utf-8'));

    it('tabWidth가 2다', () => {
      expect(prettier.tabWidth).toBe(2);
    });

    it('semi가 true다', () => {
      expect(prettier.semi).toBe(true);
    });

    it('singleQuote가 true다', () => {
      expect(prettier.singleQuote).toBe(true);
    });
  });

  describe('.eslintrc.js 설정 확인', () => {
    it('eslint:recommended가 포함되어 있다', () => {
      const content = readFileSync(resolve(root, '.eslintrc.cjs'), 'utf-8');
      expect(content).toContain('eslint:recommended');
    });

    it('@typescript-eslint/recommended가 포함되어 있다', () => {
      const content = readFileSync(resolve(root, '.eslintrc.cjs'), 'utf-8');
      expect(content).toContain('@typescript-eslint/recommended');
    });

    it('react-hooks/recommended가 포함되어 있다', () => {
      const content = readFileSync(resolve(root, '.eslintrc.cjs'), 'utf-8');
      expect(content).toContain('react-hooks/recommended');
    });
  });
});
