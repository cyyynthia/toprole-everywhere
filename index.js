/*
 * Copyright (c) 2020 Cynthia K. Rey, All rights reserved.
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
const { findInReactTree } = require('powercord/util');
const { inject, uninject } = require('powercord/injector');
const { Plugin } = require('powercord/entities');

const Settings = require('./Settings');
const TopRole = require('./TopRole');

module.exports = class TopRoles extends Plugin {
  startPlugin () {
    this.loadStylesheet('style.css');
    powercord.api.settings.registerSettings(this.entityID, {
      category: this.entityID,
      label: 'Top Roles Everywhere',
      render: Settings
    });

    this.injectChat();
    this.injectMemberList();
  }

  pluginWillUnload () {
    uninject('tre-messages');
    uninject('tre-members');
    uninject('tre-members-adjust');
    powercord.api.settings.unregisterSettings(this.entityID);
  }

  async injectChat () {
    const channels = await getModule([ 'getChannel' ]);
    const MessageTimestamp = await getModule([ 'MessageTimestamp' ]);
    inject('tre-messages', MessageTimestamp, 'default', ([ { message: { author: { id: userId }, channel_id: channelId } } ], res) => {
      if (!this.settings.get('messages', true) || !channelId) {
        return res;
      }

      const header = findInReactTree(res, e => Array.isArray(e?.props?.children) && e.props.children.find(c => c?.props?.message));
      const guildId = channels.getChannel(channelId).guild_id;
      header.props.children.push(React.createElement(TopRole, {
        region: 'messages',
        entityId: this.entityID,
        guildId,
        userId
      }));

      return res;
    });
  }

  async injectMemberList () {
    const _this = this;
    const { getMember } = await getModule([ 'getMember' ]);
    const MemberListItem = await getModuleByDisplayName('MemberListItem');

    inject('tre-members', MemberListItem.prototype, 'render', function (_, res) {
      if (!_this.settings.get('members', true)) {
        return res;
      }

      res.props.decorators.props.children.push(
        React.createElement(TopRole, {
          region: 'members',
          entityId: _this.entityID,
          guildId: this.props.guildId,
          userId: this.props.user.id
        })
      );

      if (getMember(this.props.guildId, this.props.user.id)?.roles?.length > 0) {
        res.props.className += ' tre-adjust';
      }

      return res;
    });
  }
};
