import PropTypes from 'prop-types';
import React from 'react';

import createReactClass from 'create-react-class';

import LoadingIndicator from '../../components/loadingIndicator';
import LoadingError from '../../components/loadingError';
import Avatar from '../../components/avatar';
import TimeSince from '../../components/timeSince';
import DropdownLink from '../../components/dropdownLink';
import MenuItem from '../../components/menuItem';
import ApiMixin from '../../mixins/apiMixin';
import InlineSvg from '../../components/inlineSvg';

import {t} from '../../locale';

class CommitLink extends React.Component {
  static propTypes = {
    commitId: PropTypes.string,
    repository: PropTypes.object,
    inline: PropTypes.bool,
  };

  getCommitUrl = () => {
    // TODO(jess): move this to plugins
    if (this.props.repository.provider.id === 'github') {
      return this.props.repository.url + '/commit/' + this.props.commitId;
    }
    if (this.props.repository.provider.id === 'bitbucket') {
      return this.props.repository.url + '/commits/' + this.props.commitId;
    }
    return undefined;
  };

  render() {
    let commitUrl = this.getCommitUrl();
    let shortId = this.props.commitId.slice(0, 7);

    return commitUrl ? (
      <a
        className={this.props.inline ? 'inline-commit' : 'btn btn-default btn-sm'}
        href={commitUrl}
        target="_blank"
      >
        {this.props.repository.provider.id == 'github' && (
          <InlineSvg src="icon-github" style={{verticalAlign: 'text-top'}} size="14px" />
        )}
        {this.props.repository.provider.id == 'bitbucket' && (
          <InlineSvg
            src="icon-bitbucket"
            style={{verticalAlign: 'text-top'}}
            size="14px"
          />
        )}
        &nbsp;
        {this.props.inline ? '' : ' '}
        {shortId}
      </a>
    ) : (
      <span>{shortId}</span>
    );
  }
}

class ReleaseCommit extends React.Component {
  static propTypes = {
    commitId: PropTypes.string,
    commitMessage: PropTypes.string,
    commitDateCreated: PropTypes.string,
    author: PropTypes.object,
    repository: PropTypes.object,
  };

  renderMessage = message => {
    if (!message) {
      return t('No message provided');
    }

    let firstLine = message.split(/\n/)[0];

    return firstLine;
  };

  render() {
    let {commitMessage} = this.props;
    return (
      <li className="list-group-item" key={this.props.commitId}>
        <div className="row row-center-vertically">
          <div className="col-xs-10 list-group-avatar">
            <Avatar user={this.props.author} />
            <h5 className="truncate">{this.renderMessage(commitMessage)}</h5>
            <p>
              <strong>{this.props.author.name || t('Unknown author')}</strong> committed{' '}
              <TimeSince date={this.props.commitDateCreated} />
            </p>
          </div>
          <div className="col-xs-2 align-right">
            <CommitLink
              commitId={this.props.commitId}
              repository={this.props.repository}
            />
          </div>
        </div>
      </li>
    );
  }
}

const ReleaseCommits = createReactClass({
  displayName: 'ReleaseCommits',
  mixins: [ApiMixin],

  getInitialState() {
    return {
      loading: true,
      error: false,
      commitList: [],
      activeRepo: null,
    };
  },

  componentDidMount() {
    let {orgId, projectId, version} = this.props.params;

    let path = `/projects/${orgId}/${projectId}/releases/${encodeURIComponent(
      version
    )}/commits/`;
    this.api.request(path, {
      method: 'GET',
      data: this.props.location.query,
      success: (data, _, jqXHR) => {
        this.setState({
          error: false,
          loading: false,
          commitList: data,
          pageLinks: jqXHR.getResponseHeader('Link'),
        });
      },
      error: () => {
        this.setState({
          error: true,
          loading: false,
        });
      },
    });
  },

  emptyState() {
    return (
      <div className="box empty-stream m-y-0">
        <span className="icon icon-exclamation" />
        <p>There are no commits associated with this release.</p>
        {/* Todo: Should we link to repo settings from here?  */}
      </div>
    );
  },

  setActiveRepo(repo) {
    this.setState({
      activeRepo: repo,
    });
  },

  getCommitsByRepository() {
    let {commitList} = this.state;
    let commitsByRepository = commitList.reduce(function(cbr, commit) {
      let {repository} = commit;
      if (!cbr.hasOwnProperty(repository.name)) {
        cbr[repository.name] = [];
      }

      cbr[repository.name].push(commit);
      return cbr;
    }, {});
    return commitsByRepository;
  },

  renderCommitsForRepo(repo) {
    let commitsByRepository = this.getCommitsByRepository();
    let activeCommits = commitsByRepository[repo];
    return (
      <div className="panel panel-default">
        <div className="panel-heading panel-heading-bold">
          <div className="row">
            <div className="col-xs-12">{repo}</div>
          </div>
        </div>
        <ul className="list-group list-group-lg commit-list">
          {activeCommits.map(commit => {
            return (
              <ReleaseCommit
                key={commit.id}
                commitId={commit.id}
                author={commit.author}
                commitMessage={commit.message}
                commitDateCreated={commit.dateCreated}
                repository={commit.repository}
              />
            );
          })}
        </ul>
      </div>
    );
  },

  render() {
    if (this.state.loading) return <LoadingIndicator />;

    if (this.state.error) return <LoadingError />;

    let {commitList, activeRepo} = this.state;

    if (!commitList.length) return <this.emptyState />;
    let commitsByRepository = this.getCommitsByRepository();
    return (
      <div>
        <div className="heading">
          {Object.keys(commitsByRepository).length > 1 ? (
            <div className="commits-dropdown align-left">
              <div className="commits-dropdowng">
                <DropdownLink
                  caret={true}
                  title={this.state.activeRepo || 'All Repositories'}
                >
                  <MenuItem
                    key="all"
                    noAnchor={true}
                    onClick={() => {
                      this.setActiveRepo(null);
                    }}
                    isActive={this.state.activeRepo === null}
                  >
                    <a>All Repositories</a>
                  </MenuItem>
                  {Object.keys(commitsByRepository).map(repository => {
                    return (
                      <MenuItem
                        key={commitsByRepository[repository].id}
                        noAnchor={true}
                        onClick={() => {
                          this.setActiveRepo(repository);
                        }}
                        isActive={this.state.activeRepo === repository}
                      >
                        <a>{repository}</a>
                      </MenuItem>
                    );
                  })}
                </DropdownLink>
              </div>
            </div>
          ) : null}
        </div>
        {activeRepo
          ? this.renderCommitsForRepo(activeRepo)
          : Object.keys(commitsByRepository).map(repository => {
              return this.renderCommitsForRepo(repository);
            })}
      </div>
    );
  },
});

export default ReleaseCommits;
export {ReleaseCommit, CommitLink};
