class HealthService {
  constructor(repository = null, cache = null, metrics = null) {
    this.repository = repository;
    this.cache = cache;
    this.metrics = metrics;
    this.GetHealth = this.GetHealth.bind(this);
  }
}

HealthService.prototype.GetHealth = function () {
  return "Service health is good";
};

function NewHealthService(repository = null, cache = null, metrics = null) {
  return new HealthService(repository, cache, metrics);
}

module.exports.NewHealthService = NewHealthService;
