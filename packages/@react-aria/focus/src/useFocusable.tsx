/*
 * Copyright 2020 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {FocusableDOMProps, FocusableProps} from '@react-types/shared';
import {mergeProps} from '@react-aria/utils';
import React, {HTMLAttributes, MutableRefObject, ReactNode, RefObject, useContext, useEffect} from 'react';
import {useFocus, useKeyboard} from '@react-aria/interactions';

interface FocusableOptions extends FocusableProps, FocusableDOMProps {
  /** Whether focus should be disabled. */
  isDisabled?: boolean
}

interface FocusableContextProps extends HTMLAttributes<HTMLElement> {
  children?: ReactNode,
  ref?: MutableRefObject<HTMLElement>
}

export let FocusableContext = React.createContext<FocusableContextProps>(null);


export function useFocusableContext(ref: RefObject<HTMLElement>): FocusableContextProps {
  let context = useContext(FocusableContext) || {} as FocusableContextProps;

  useEffect(() => {
    if (context && context.ref) {
      context.ref.current = ref.current;
      return () => {
        context.ref.current = null;
      };
    }
  }, [context, ref]);

  return context;
}

export let FocusableProvider = React.forwardRef((props: FocusableContextProps, ref: RefObject<HTMLElement>) => {
  let {children, ...otherProps} = props;
  let context = {
    ...otherProps,
    ref
  };

  return (
    <FocusableContext.Provider value={context}>
      {children}
    </FocusableContext.Provider>
  );
});

/**
 * Used to make an element focusable and capable of auto focus.
 */
export function useFocusable(props: FocusableOptions, domRef: RefObject<HTMLElement>) {
  let {focusProps} = useFocus(props);
  let {keyboardProps} = useKeyboard(props);
  let interactions = mergeProps(focusProps, keyboardProps);
  let domProps = useFocusableContext(domRef);
  let interactionProps = props.isDisabled ? {} : domProps

  useEffect(() => {
    if (props.autoFocus && domRef.current) {
      domRef.current.focus();
    }
  }, [props.autoFocus, domRef]);

  return {
    focusableProps: mergeProps(
      {
        ...interactions,
        tabIndex: props.excludeFromTabOrder && !props.isDisabled ? -1 : undefined
      },
      interactionProps
    )
  };
}
