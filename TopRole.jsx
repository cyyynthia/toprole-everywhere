/*
 * Copyright (c) 2020 Bowser65
 * Licensed under the Open Software License version 3.0
 */

const { React, Flux, getModule } = require('powercord/webpack');
const MemberRole = require('./MemberRole');

const TopRole = React.memo(
  (props) => {
    if (!props.role || !props.shouldRender) {
      return null;
    }

    const textColor = React.useMemo(() => {
      const r = (props.role.color & 0xff0000) >>> 16;
      const g = (props.role.color & 0xff00) >>> 8;
      const b = props.role.color & 0xff;
      const bgDelta = (r * 0.299) + (g * 0.587) + (b * 0.114);
      return 255 - bgDelta < 105 ? '#000000' : '#ffffff';
    }, [ props.role.color ]);

    if (props.displayMode === 'role') {
      return (
        <span className='toprole-wrapper role'>
          <MemberRole role={props.role}/>
        </span>
      );
    }

    if (props.displayMode === 'tag') {
      const botTagRegularClasses = getModule([ 'botTagRegular' ], false);
      const botTagCozyClasses = getModule([ 'botTagCozy' ], false);
      const remClasses = getModule([ 'rem' ], false);
      const classes = props.region === 'members'
        ? `${remClasses.botTag} ${botTagRegularClasses.botTagRegular} ${remClasses.px}`
        : `${botTagCozyClasses.botTagCozy} ${botTagRegularClasses.botTagRegular} ${remClasses.rem}`;

      return (
        <span className={`${classes} toprole-wrapper tag`} style={{
          backgroundColor: props.role.colorString,
          color: textColor
        }}>
          <div className={botTagRegularClasses.botText}>{props.role.name}</div>
        </span>
      );
    }
  },
  (oldProps, newProps) => (
    oldProps.role?.id === newProps.role?.id &&
    oldProps.role?.name === newProps.role?.name &&
    oldProps.role?.color === newProps.role?.color &&
    oldProps.shouldRender === newProps.shouldRender &&
    oldProps.displayMode === newProps.displayMode
  )
);

module.exports = Flux.connectStoresAsync(
  [ getModule([ 'getMember' ]), getModule([ 'getGuild' ]), powercord.api.settings.store ],
  ([ membersStore, guildsStore ], props) => {
    let role = null;
    const member = membersStore.getMember(props.guildId, props.userId);
    if (member) {
      const guild = guildsStore.getGuild(props.guildId);
      const topRole = Object.entries(guild.roles)
        .sort(([ , a ], [ , b ]) => a.position < b.position ? 1 : a.position > b.position ? -1 : 0)
        .find(([ id ]) => member.roles.includes(id));

      if (topRole) {
        // eslint-disable-next-line prefer-destructuring
        role = topRole[1];
      }
    }

    return {
      role,
      shouldRender: powercord.api.settings.store.getSetting(props.entityId, props.region, true),
      displayMode: powercord.api.settings.store.getSetting(props.entityId, 'displayMode', 'role')
    };
  }
)(TopRole);
