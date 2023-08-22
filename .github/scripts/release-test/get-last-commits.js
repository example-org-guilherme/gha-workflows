
module.exports = async ({ github, context, core }) => {

  console.info("Getting last commits 5 for default branch")

  const commits = (await github.rest.repos.listCommits({
    owner: context.repo.owner,
    repo: context.repo.repo,
    per_page: 5
  })).data

  if (!commits || !commits.length) {
    core.setFailed(`Could not find commits for this repo. For these tests, we need 5 commits!`)
  }

  commits.reverse()

  commits.forEach((c, i) => {
    i++
    console.info("Setting commit output for commit [%d] - %s", i, c.sha)
    core.setOutput("commit" + i, c.sha)
  })

}