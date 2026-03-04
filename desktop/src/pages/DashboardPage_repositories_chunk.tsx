      case "repositories":
return (
    <motion.div
        key="repositories"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        className="space-y-6"
    >
        <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">All Repositories</h2>
            <div className="text-sm text-muted-foreground">
                {filteredRepos.length} repositories
            </div>
        </div>

        {filteredRepos.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {filteredRepos.map((repo: any, index: number) => (
                    <RepositoryCard key={repo.id} repository={repo} index={index} />
                ))}
            </div>
        ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                <p>No repositories found.</p>
            </div>
        )}
    </motion.div>
);

