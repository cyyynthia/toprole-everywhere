/*
 * Copyright (c) 2020 Bowser65
 * Licensed under the Open Software License version 3.0
 */

const { React, getModule, getAllModules, getModuleByDisplayName } = require('powercord/webpack');
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
