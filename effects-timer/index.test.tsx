import type { TestProps } from '@alfons-app/pdk';
import { renderHook } from '@testing-library/react-hooks';
import timerEffect from './index';
import definition from './editor';

const getMockTestProps = (testID: string = 'test') => ({ testID, ['data-test-id']: testID }) as TestProps;

describe('effects-timer', () => {
  it('should run effect on init and props update', () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

    const testProps = definition.schema.parse({});
      ...testProps,
      ...getMockTestProps(),
      children: [],
    };

    renderHook(() => timerEffect(props));
    
    expect(consoleSpy).toHaveBeenCalledWith('timerEffect', props);

    consoleSpy.mockRestore();
  });
});
