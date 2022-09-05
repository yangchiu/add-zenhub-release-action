const core = require('@actions/core');
const github = require('@actions/github');
const axios = require('axios').default;
const { inspect } = require("util");

Date.prototype.addDays = function(days) {
  var date = new Date(this.valueOf());
  date.setDate(date.getDate() + days);
  return date;
}

async function getReleaseIdFromReleaseName(repo_id, release_name) {
  console.log(`==> get release id from release name:`)
  const url = `https://api.zenhub.com/p1/repositories/${repo_id}/reports/releases`
  const response = await axios.get(url);
  console.log(`Get releases: ${inspect(response)}`);
  for (const release of response.data) {
    console.log(`Iterate release ${inspect(release)}`)
    if (release.title === release_name) return release.release_id
  }
  return null
}

async function createRelease(repo_id, 
                             release_name, 
                             description='', 
                             start_date=new Date().toISOString(), 
                             desired_end_date=new Date().addDays(14).toISOString()) {
  console.log(`==> create release:`)
  const url = `https://api.zenhub.com/p1/repositories/${repo_id}/reports/release`
  const response = await axios.post(url, {
    title: release_name,
    description: description,
    start_date: start_date,
    desired_end_date: desired_end_date
  });
  console.log(`Create release: ${inspect(response)}`);
  return response.data.release_id;
}

async function addIssueToRelease(repo_id, release_id, issue_number) {
  console.log(`==> add issue to release:`)
  const url = `https://api.zenhub.com/p1/reports/release/${release_id}/issues`
  console.log(url);
  const body = {
    'add_issues': [
      { 'repo_id': repo_id * 1, 'issue_number': issue_number * 1 }
    ],
    'remove_issues': []
  };
  console.log(body);
  const response = await axios.patch(url, body);
  console.log(`Add issue to release: ${inspect(response)}`);
}

async function run() {

  try {

    const zenhub_token = core.getInput('zenhub_token');
    if (zenhub_token && zenhub_token.length > 0) {
      axios.defaults.headers.common['X-Authentication-Token'] = zenhub_token;
      console.log('Get zenhub_token and set to header');
    } else {
      throw Error('expect zenhub_token but it\'s null!');
    }

    const repo_id = core.getInput('repo_id');
    console.log(`Get repo_id: ${repo_id}`);

    const issue_number = core.getInput('issue_number');
    console.log(`Get issue_number: ${issue_number}`);

    const release_name = core.getInput('release_name');
    console.log(`Get release_name: ${release_name}`);

    let release_id = ''
    release_id = await getReleaseIdFromReleaseName(repo_id, release_name);
    if (!release_id) {
      console.log(`Release ${release_name} doesn't exist, create a new one`)
      release_id = await createRelease(repo_id, release_name);
      if (!release_id) throw Error('expect release_id but it\s null!');  
    }

    await addIssueToRelease(repo_id, release_id, issue_number);

  } catch (error) {

    core.setFailed(error.message);

  }

}

run();
