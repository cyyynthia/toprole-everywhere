/*
 * Copyright (c) 2020 Bowser65
 * Licensed under the Open Software License version 3.0
 */

const { React } = require('powercord/webpack');
const { RadioGroup, SwitchItem } = require('powercord/components/settings');

module.exports = React.memo(
  (props) => (
    <React.Fragment>
      <RadioGroup
        onChange={e => props.updateSetting('displayMode', e.value)}
        value={props.getSetting('displayMode', 'role')}
        options={[
          {
            name: 'Role',
            desc: 'Displays as a role in user popout.',
            value: 'role'
          },
          {
            name: 'Tag',
            desc: 'Displays like a BOT tag.',
            value: 'tag'
          }
        ]}
      >
        Display mode
      </RadioGroup>
      <SwitchItem
        value={props.getSetting('messages', true)}
        onChange={() => props.toggleSetting('messages', true)}
        note='Whether the top role should be displayed in the chat or not.'
      >
        Messages
      </SwitchItem>
      <SwitchItem
        value={props.getSetting('members', true)}
        onChange={() => props.toggleSetting('members', true)}
        note='Whether the top role should be displayed in the members list or not.'
      >
        Members
      </SwitchItem>
    </React.Fragment>
  )
);
