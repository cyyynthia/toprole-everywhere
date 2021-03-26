/*
 * Copyright (c) 2020-2021 Cynthia K. Rey, All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 * 1. Redistributions of source code must retain the above copyright notice, this
 *    list of conditions and the following disclaimer.
 * 2. Redistributions in binary form must reproduce the above copyright notice,
 *    this list of conditions and the following disclaimer in the
 *    documentation and/or other materials provided with the distribution.
 * 3. Neither the name of the copyright holder nor the names of its contributors
 *    may be used to endorse or promote products derived from this software without
 *    specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
 * ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
 * FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
 * DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
 * SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
 * CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
 * OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

const { React, getModule, getModuleByDisplayName } = require('powercord/webpack');
const { AsyncComponent } = require('powercord/components');
const { sleep } = require('powercord/util');

module.exports = AsyncComponent.from((async () => {
  // Yes
  const userStore = await getModule([ 'getCurrentUser' ]);
  const functionalUserPopout = await getModuleByDisplayName('ConnectedUserPopout');

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

  const ogGetCurrentUser = userStore.getCurrentUser
  userStore.getCurrentUser = () => ({ id: '0' })

  const MemberRole = functionalUserPopout({ user: { isNonUserBot: () => void 0 } }).type
    .prototype.renderRoles.call({ props: fakeProps })[1].type(fakeProps).type
    .call(null, fakeProps).props.children.props.children({})
    .props.children[0].type;

  userStore.getCurrentUser = ogGetCurrentUser

  // React Hooks moment
  owo.useMemo = ogUseMemo;
  owo.useState = ogUseState;
  owo.useEffect = ogUseEffect;
  owo.useLayoutEffect = ogUseLayoutEffect;
  owo.useCallback = ogUseCallback;
  owo.useReducer = ogUseReducer;
  owo.useRef = ogUseRef;

  // Poggers moment
  return function (props) {
    const res = React.createElement(MemberRole, props).type.render(props)
    delete res.props.children.props['data-list-item-id']
    return res
  };
})());