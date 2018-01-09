import PropTypes from 'prop-types';
import React from 'react';
import {shallow, mount} from 'enzyme';

import {Client} from 'app/api';
import AccountIdentities from 'app/views/settings/account/accountIdentities';

describe('AccountIdentities', function() {
  beforeEach(function() {
    Client.clearMockResponses();
  });

  it('renders empty', function() {
    Client.addMockResponse({
      url: '/account/identities/',
      method: 'GET',
      body: [],
    });

    let wrapper = shallow(<AccountIdentities />, {
      context: {
        router: TestStubs.router(),
      },
      childContextTypes: {
        router: PropTypes.object,
      },
    });

    expect(wrapper).toMatchSnapshot();
  });

  it('renders list', function() {
    Client.addMockResponse({
      url: '/account/identities/',
      method: 'GET',
      body: [
        {
          id: '1',
          provider: 'github',
          provider_label: 'Github',
        },
      ],
    });

    let wrapper = shallow(<AccountIdentities />, {
      context: {
        router: TestStubs.router(),
      },
      childContextTypes: {
        router: PropTypes.object,
      },
    });
    expect(wrapper).toMatchSnapshot();
  });

  it('disconnects identity', function() {
    Client.addMockResponse({
      url: '/account/identities/',
      method: 'GET',
      body: [
        {
          id: '1',
          provider: 'github',
          provider_label: 'Github',
        },
      ],
    });

    let wrapper = mount(<AccountIdentities />, {
      context: {
        router: TestStubs.router(),
      },
      childContextTypes: {
        router: PropTypes.object,
      },
    });

    let disconnectRequest = {
      url: '/account/identities/1/',
      method: 'DELETE',
    };

    Client.addMockResponse(disconnectRequest);

    expect(Client.getCallCount(disconnectRequest)).toBe(0);

    wrapper
      .find('Button')
      .first()
      .simulate('click');

    expect(Client.getCallCount(disconnectRequest)).toBe(1);
  });
});
