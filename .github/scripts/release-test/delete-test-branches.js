
module.exports = async ({github, context}) =>  {

    const testBranchPrefix = process.env.TEST_BRANCH_PREFIX

    console.info("Deleting test branches with prefix [%s]", testBranchPrefix)
  
    const branches = (await github.rest.repos.listBranches({
      owner: context.repo.owner,
      repo: context.repo.repo,
      per_page: 100
    })).data

    let total = 0
    for (const branch of branches) {
      if (branch.name.indexOf(testBranchPrefix) == 0)  {
        total++
        console.info("Found branch eligible for deletion: %s", branch.name)
        await github.rest.git.deleteRef({
            owner: context.repo.owner,
            repo: context.repo.repo,
            ref: "heads/" + branch.name
          })
      }
    }

    console.log("Deleted [%d] branch(es)", total)
    
  }