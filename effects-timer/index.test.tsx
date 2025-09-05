import timerEffect from './index';
import { renderHook } from '@testing-library/react-hooks';
import type { TestProps } from '@alfons-app/pdk';

const getMockTestProps = (testID: string) => ({ testID } as TestProps);

describe('effects-timer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  const testId = 'timer';

  it('should call action once after timeout (single-shot mode)', () => {
    const testProps = {
      action: { __$ref: 'test-action' } as const,
      interval: 1000,
      repeat: false,
      unit: 'ms' as const,
      ...getMockTestProps(testId),
    };

    const runAction = jest.fn();
    const getAction = jest.fn(() => runAction);
    jest.spyOn(require('react'), 'useContext').mockReturnValue({ getAction });

    renderHook(() => timerEffect(testProps));

    // Action should not be called immediately
    expect(runAction).not.toHaveBeenCalled();

    // Fast-forward time by 1000ms
    jest.advanceTimersByTime(1000);

    // Action should be called once
    expect(runAction).toHaveBeenCalledTimes(1);
    expect(getAction).toHaveBeenCalledWith('test-action');

    // Fast-forward more time - should not be called again (single-shot)
    jest.advanceTimersByTime(2000);
    expect(runAction).toHaveBeenCalledTimes(1);
  });

  it('should call action repeatedly when repeat is enabled', () => {
    const testProps = {
      action: { __$ref: 'repeat-action' } as const,
      interval: 500,
      repeat: true,
      unit: 'ms' as const,
      ...getMockTestProps(testId),
    };

    const runAction = jest.fn();
    const getAction = jest.fn(() => runAction);
    jest.spyOn(require('react'), 'useContext').mockReturnValue({ getAction });

    renderHook(() => timerEffect(testProps));

    // Action should not be called immediately
    expect(runAction).not.toHaveBeenCalled();

    // First interval: 500ms
    jest.advanceTimersByTime(500);
    expect(runAction).toHaveBeenCalledTimes(1);

    // Second interval: 500ms more
    jest.advanceTimersByTime(500);
    expect(runAction).toHaveBeenCalledTimes(2);

    // Third interval: 500ms more
    jest.advanceTimersByTime(500);
    expect(runAction).toHaveBeenCalledTimes(3);

    expect(getAction).toHaveBeenCalledWith('repeat-action');
  });

  it('should convert seconds to milliseconds correctly', () => {
    const testProps = {
      action: { __$ref: 'seconds-action' } as const,
      interval: 2,
      repeat: false,
      unit: 's' as const,
      ...getMockTestProps(testId),
    };

    const runAction = jest.fn();
    const getAction = jest.fn(() => runAction);
    jest.spyOn(require('react'), 'useContext').mockReturnValue({ getAction });

    renderHook(() => timerEffect(testProps));

    // 1 second should not trigger (interval is 2 seconds)
    jest.advanceTimersByTime(1000);
    expect(runAction).not.toHaveBeenCalled();

    // 2 seconds should trigger
    jest.advanceTimersByTime(1000);
    expect(runAction).toHaveBeenCalledTimes(1);
    expect(getAction).toHaveBeenCalledWith('seconds-action');
  });

  it('should not call action when interval is 0', () => {
    const testProps = {
      action: { __$ref: 'zero-interval' } as const,
      interval: 0,
      repeat: false,
      unit: 'ms' as const,
      ...getMockTestProps(testId),
    };

    const runAction = jest.fn();
    const getAction = jest.fn(() => runAction);
    jest.spyOn(require('react'), 'useContext').mockReturnValue({ getAction });

    renderHook(() => timerEffect(testProps));

    jest.advanceTimersByTime(5000);
    expect(runAction).not.toHaveBeenCalled();
  });

  it('should not call action when action reference is missing', () => {
    const testProps = {
      action: undefined,
      interval: 1000,
      repeat: false,
      unit: 'ms' as const,
      ...getMockTestProps(testId),
    };

    const runAction = jest.fn();
    const getAction = jest.fn(() => runAction);
    jest.spyOn(require('react'), 'useContext').mockReturnValue({ getAction });

    renderHook(() => timerEffect(testProps));

    jest.advanceTimersByTime(1000);
    expect(runAction).not.toHaveBeenCalled();
  });

  it('should handle when getAction returns undefined', () => {
    const testProps = {
      action: { __$ref: 'missing-action' } as const,
      interval: 1000,
      repeat: false,
      unit: 'ms' as const,
      ...getMockTestProps(testId),
    };

    const getAction = jest.fn(() => undefined);
    jest.spyOn(require('react'), 'useContext').mockReturnValue({ getAction });

    renderHook(() => timerEffect(testProps));

    jest.advanceTimersByTime(1000);
    expect(getAction).toHaveBeenCalledWith('missing-action');
    // No error should be thrown, action just doesn't execute
  });

  it('should restart timer when dependencies change', () => {
    let testProps = {
      action: { __$ref: 'restart-action' } as const,
      interval: 1000,
      repeat: false,
      unit: 'ms' as const,
      ...getMockTestProps(testId),
    };

    const runAction = jest.fn();
    const getAction = jest.fn(() => runAction);
    jest.spyOn(require('react'), 'useContext').mockReturnValue({ getAction });

    const { rerender } = renderHook(() => timerEffect(testProps));

    // Wait 500ms (half of interval)
    jest.advanceTimersByTime(500);
    expect(runAction).not.toHaveBeenCalled();

    // Change interval - should restart timer
    testProps = { ...testProps, interval: 2000 };
    rerender();

    // Original timer should be cancelled, need full 2000ms from restart
    jest.advanceTimersByTime(500); // Total 1000ms from original start, but only 500ms since restart
    expect(runAction).not.toHaveBeenCalled();

    jest.advanceTimersByTime(1500); // Now 2000ms since restart
    expect(runAction).toHaveBeenCalledTimes(1);
  });

  it('should clean up timer on unmount', () => {
    const testProps = {
      action: { __$ref: 'cleanup-action' } as const,
      interval: 1000,
      repeat: true,
      unit: 'ms' as const,
      ...getMockTestProps(testId),
    };

    const runAction = jest.fn();
    const getAction = jest.fn(() => runAction);
    jest.spyOn(require('react'), 'useContext').mockReturnValue({ getAction });

    const { unmount } = renderHook(() => timerEffect(testProps));

    // Start timer
    jest.advanceTimersByTime(1000);
    expect(runAction).toHaveBeenCalledTimes(1);

    // Unmount component
    unmount();

    // Timer should not continue after unmount
    jest.advanceTimersByTime(1000);
    expect(runAction).toHaveBeenCalledTimes(1); // Should still be 1, not 2
  });

  it('should handle action reference changes', () => {
    const firstAction = { __$ref: 'first-action' } as const;
    const secondAction = { __$ref: 'second-action' } as const;

    let testProps: {
      action: typeof firstAction | typeof secondAction;
      interval: number;
      repeat: boolean;
      unit: 'ms' | 's';
    } & TestProps = {
      action: firstAction,
      interval: 1000,
      repeat: false,
      unit: 'ms' as const,
      ...getMockTestProps(testId),
    };

    const firstRunAction = jest.fn();
    const secondRunAction = jest.fn();

    const getAction = jest.fn((ref) => {
      if (ref === 'first-action') return firstRunAction;
      if (ref === 'second-action') return secondRunAction;
      return undefined;
    });

    jest.spyOn(require('react'), 'useContext').mockReturnValue({ getAction });

    const { rerender } = renderHook(() => timerEffect(testProps));

    // Change action reference before timer fires
    testProps = { ...testProps, action: secondAction };
    rerender();

    jest.advanceTimersByTime(1000);

    // Second action should be called, not first
    expect(secondRunAction).toHaveBeenCalledTimes(1);
    expect(firstRunAction).not.toHaveBeenCalled();
    expect(getAction).toHaveBeenCalledWith('second-action');
  });

  it('should handle repeat mode with different units', () => {
    const testProps = {
      action: { __$ref: 'repeat-seconds' } as const,
      interval: 1,
      repeat: true,
      unit: 's' as const,
      ...getMockTestProps(testId),
    };

    const runAction = jest.fn();
    const getAction = jest.fn(() => runAction);
    jest.spyOn(require('react'), 'useContext').mockReturnValue({ getAction });

    renderHook(() => timerEffect(testProps));

    // Should trigger every 1000ms (1 second)
    jest.advanceTimersByTime(1000);
    expect(runAction).toHaveBeenCalledTimes(1);

    jest.advanceTimersByTime(1000);
    expect(runAction).toHaveBeenCalledTimes(2);
  });
});
