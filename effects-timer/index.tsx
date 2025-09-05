import { useEffect, useCallback, useContext, useRef } from 'react';
import { ActionContext, type Effect } from '@alfons-app/pdk';
import type { Props } from './editor';

const timerEffect: Effect<Props> = ({ action, interval, repeat, unit }) => {
  const { getAction } = useContext(ActionContext);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const intervalInMs = unit === 's' ? interval * 1000 : interval;

  const callAction = useCallback(() => {
    const actionFn = getAction(action?.__$ref);
    actionFn?.();
  }, [action?.__$ref, getAction]);

  useEffect(
    // eslint-disable-next-line no-restricted-syntax
    () => {
      // Clear any existing timer
      if (timerRef.current) {
        clearInterval(timerRef.current);
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }

      // Only start timer if there is a valid interval and action
      if (intervalInMs > 0 && action?.__$ref) {
        if (repeat) {
          timerRef.current = setInterval(callAction, intervalInMs);
        } else {
          timerRef.current = setTimeout(callAction, intervalInMs);
        }
      }

      // Cleanup
      return () => {
        if (timerRef.current) {
          clearInterval(timerRef.current);
          clearTimeout(timerRef.current);
          timerRef.current = null;
        }
      };
    },
    [callAction, intervalInMs, repeat, action?.__$ref]
  );
};

export default timerEffect;
