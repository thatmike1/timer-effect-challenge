import type { Effect } from '@alfons-app/pdk';
import { useEffect } from 'react';
import type { Props } from './editor';

const timerEffect: Effect<Props> = props => {
  const callback = () => {
    console.log('timerEffect', props);
  };
  useEffect(callback, []);
};

export default timerEffect;
