import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Modal } from '../components/Modal';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { Spinner } from '../components/Spinner';
import { Toast } from '../components/Toast';
import { ToastContainer } from '../components/ToastContainer';
import { useUiStore } from '../stores/uiStore';

describe('FE-09: 공통 UI 컴포넌트', () => {
  describe('Button', () => {
    it('기본 렌더링', () => {
      render(<Button>클릭</Button>);
      expect(screen.getByRole('button', { name: '클릭' })).toBeTruthy();
    });

    it('loading=true 시 disabled', () => {
      render(<Button loading>제출</Button>);
      expect(screen.getByRole('button')).toBeDisabled();
    });

    it('disabled prop 전달', () => {
      render(<Button disabled>버튼</Button>);
      expect(screen.getByRole('button')).toBeDisabled();
    });

    it('variant=danger 버튼 렌더링', () => {
      render(<Button variant="danger">삭제</Button>);
      expect(screen.getByRole('button', { name: '삭제' })).toBeTruthy();
    });
  });

  describe('Input', () => {
    it('label 렌더링', () => {
      render(<Input id="test" label="이메일" />);
      expect(screen.getByLabelText('이메일')).toBeTruthy();
    });

    it('error 메시지 표시', () => {
      render(<Input id="test" error="필수 입력입니다." />);
      expect(screen.getByText('필수 입력입니다.')).toBeTruthy();
    });

    it('onChange 호출', () => {
      const onChange = vi.fn();
      render(<Input id="test" onChange={onChange} />);
      fireEvent.change(screen.getByRole('textbox'), { target: { value: 'abc' } });
      expect(onChange).toHaveBeenCalled();
    });
  });

  describe('Modal', () => {
    it('title, children 렌더링', () => {
      render(
        <Modal title="테스트 모달" onClose={vi.fn()}>
          <p>내용</p>
        </Modal>
      );
      expect(screen.getByText('테스트 모달')).toBeTruthy();
      expect(screen.getByText('내용')).toBeTruthy();
    });

    it('배경 클릭 시 onClose 호출', () => {
      const onClose = vi.fn();
      render(
        <Modal title="모달" onClose={onClose}>
          <p>내용</p>
        </Modal>
      );
      fireEvent.click(screen.getByRole('dialog').parentElement!);
      expect(onClose).toHaveBeenCalled();
    });

    it('ESC 키 시 onClose 호출', () => {
      const onClose = vi.fn();
      render(
        <Modal title="모달" onClose={onClose}>
          <p>내용</p>
        </Modal>
      );
      fireEvent.keyDown(document, { key: 'Escape' });
      expect(onClose).toHaveBeenCalled();
    });

    it('닫기 버튼 클릭 시 onClose 호출', () => {
      const onClose = vi.fn();
      render(
        <Modal title="모달" onClose={onClose}>
          내용
        </Modal>
      );
      fireEvent.click(screen.getByLabelText('닫기'));
      expect(onClose).toHaveBeenCalled();
    });
  });

  describe('ConfirmDialog', () => {
    it('메시지 표시', () => {
      render(
        <ConfirmDialog
          message="삭제하시겠습니까?"
          onConfirm={vi.fn()}
          onCancel={vi.fn()}
        />
      );
      expect(screen.getByText('삭제하시겠습니까?')).toBeTruthy();
    });

    it('확인 버튼 클릭 시 onConfirm', () => {
      const onConfirm = vi.fn();
      render(
        <ConfirmDialog message="삭제?" onConfirm={onConfirm} onCancel={vi.fn()} />
      );
      fireEvent.click(screen.getByText('확인'));
      expect(onConfirm).toHaveBeenCalled();
    });

    it('취소 버튼 클릭 시 onCancel', () => {
      const onCancel = vi.fn();
      render(
        <ConfirmDialog message="삭제?" onConfirm={vi.fn()} onCancel={onCancel} />
      );
      fireEvent.click(screen.getByText('취소'));
      expect(onCancel).toHaveBeenCalled();
    });
  });

  describe('Spinner', () => {
    it('role=status 렌더링', () => {
      render(<Spinner />);
      expect(screen.getByRole('status')).toBeTruthy();
    });
  });

  describe('Toast & ToastContainer', () => {
    it('Toast 메시지 표시 및 닫기', () => {
      const toast = { id: 'toast-1', message: '성공!', type: 'success' as const };
      const removeToast = vi.fn();
      useUiStore.setState({ toasts: [toast], addToast: vi.fn(), removeToast });
      render(<Toast toast={toast} />);
      expect(screen.getByText('성공!')).toBeTruthy();
      fireEvent.click(screen.getByLabelText('닫기'));
      expect(removeToast).toHaveBeenCalledWith('toast-1');
    });

    it('ToastContainer 다수 토스트 렌더링', () => {
      useUiStore.setState({
        toasts: [
          { id: '1', message: '첫번째', type: 'info' },
          { id: '2', message: '두번째', type: 'error' },
        ],
        addToast: vi.fn(),
        removeToast: vi.fn(),
      });
      render(<ToastContainer />);
      expect(screen.getByText('첫번째')).toBeTruthy();
      expect(screen.getByText('두번째')).toBeTruthy();
    });
  });
});
