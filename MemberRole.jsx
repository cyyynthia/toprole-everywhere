/*
 * Copyright (c) 2020 Bowser65
 * Licensed under the Open Software License version 3.0
 */

const { React, getModule, getModuleByDisplayName } = require('powercord/webpack');
const { AsyncComponent } = require('powercord/components');
const { sleep } = require('powercord/util');

module.exports = AsyncComponent.from((async () => {
  // Yes
  const userStore = await getModule([ 'getCurrentUser' ]);
  while (!userStore.getCurrentUser()) {
    await sleep(10);
  }

  const functionalUserPopout = await getModuleByDisplayName('UserPopout');

  // React Honks moment
  const owo = React.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentDispatcher.current;
  const ogUseMemo = owo.useMemo;
  const ogUseState = owo.useState;
  const ogUseEffect = owo.useEffect;
  const ogUseLayoutEffect = owo.useLayoutEffect;
  const ogUseCallback = owo.useCallback;
  const ogUseReducer = owo.useReducer;
  const ogUseRef = owo.useRef;

  owo.useMemo = () => ({
    length: 1,
    getItemProps: () => void 0,
    getContainerProps: () => void 0,
    map: (fn) => fn({}, 0)
  });
  owo.useState = () => [ null, () => void 0 ];
  owo.useEffect = () => null;
  owo.useLayoutEffect = () => null;
  owo.useCallback = () => () => void 0;
  owo.useRef = () => ({});
  owo.useReducer = (_, a) => [ a, () => void 0 ];

  // Render moment
  const fakeProps = {
    guildMember: { roles: [ '0' ] },
    guild: { roles: { 0: { id: '0' } } },
    user: {},
    userRoles: [ '0' ]
  };

  const MemberRole = functionalUserPopout({ user: { isNonUserBot: () => void 0 } }).type
    .prototype.renderRoles.call({ props: fakeProps })[1].type
    .prototype.render.call({ memoizedGetStateFromStores: () => void 0 }).type
    .prototype.render.call({ props: fakeProps }).type
    .call(null, fakeProps).props.children.props.children({})
    .props.children[0].type;

  // React Hooks moment
  owo.useMemo = ogUseMemo;
  owo.useState = ogUseState;
  owo.useEffect = ogUseEffect;
  owo.useLayoutEffect = ogUseLayoutEffect;
  owo.useCallback = ogUseCallback;
  owo.useReducer = ogUseReducer;
  owo.useRef = ogUseRef;

  // Poggers moment
  return MemberRole;
})());
