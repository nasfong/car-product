# Lighthouse CI Setup with GitHub Actions

## Overview
Lighthouse performance tests now run automatically on GitHub's infrastructure for fair, consistent results.

## How It Works

### Triggers
- ✅ Runs on every **Pull Request** to `main` or `develop`
- ✅ Runs on every **Push** to `main` branch
- ✅ Part of the CI/CD pipeline (after lint & build jobs)

### What It Does
1. **Builds the project** - Creates optimized production bundle
2. **Starts production server** - Runs Next.js in production mode
3. **Runs Lighthouse 3 times** - Captures average performance metrics
4. **Comments on PR** - Posts detailed performance scores
5. **Uploads results** - Stores to temporary public storage

## Performance Report on PRs

When you open a pull request, you'll see a comment like:

```
## 🚀 Lighthouse Performance Report

| Category | Score |
|----------|-------|
| 🟢 Performance | 92/100 |
| 🟢 Accessibility | 95/100 |
| 🟢 Best Practices | 90/100 |
| 🟢 SEO | 92/100 |

[View detailed report](https://...)
```

Color codes:
- 🟢 **Green**: 90+ (Good)
- 🟡 **Yellow**: 75-89 (Needs improvement)
- 🔴 **Red**: <75 (Critical)

## Configuration

### lighthouserc.json
The Lighthouse CI configuration file defines:
- URLs to test (homepage, key pages)
- Number of runs (3 for consistency)
- Performance thresholds
- Assertion rules

Current settings:
```json
{
  "ci": {
    "collect": {
      "url": ["http://localhost:3000/"],
      "numberOfRuns": 3
    },
    "assert": {
      "assertions": {
        "categories:performance": ["error", { "minScore": 0.75 }],
        "categories:accessibility": ["error", { "minScore": 0.85 }],
        "categories:best-practices": ["error", { "minScore": 0.85 }],
        "categories:seo": ["error", { "minScore": 0.85 }]
      }
    }
  }
}
```

## Customization

### Add More URLs to Test
Edit `lighthouserc.json`:
```json
{
  "collect": {
    "url": [
      "http://localhost:3000/",
      "http://localhost:3000/cars/[sample-id]"
    ],
    "numberOfRuns": 3
  }
}
```

### Adjust Performance Thresholds
Modify the `assert` section to be stricter or more lenient:
```json
"categories:performance": ["error", { "minScore": 0.90 }]  // Stricter
"categories:performance": ["warn", { "minScore": 0.70 }]   // Warning only
```

### Change Number of Runs
```json
"numberOfRuns": 5  // More runs = more consistent averages
```

## Debugging Failed Checks

If Lighthouse CI fails in GitHub Actions:

1. **Check the workflow logs**
   - Go to your PR → Checks tab
   - Click on "Lighthouse Performance Testing"
   - View the full logs

2. **Common issues**
   - Server didn't start: Check `.github/workflows/ci.yml` wait timeout
   - Performance threshold too high: Adjust `lighthouserc.json`
   - Timeout waiting for page: Increase timeout or check if page has errors

3. **Run locally to debug**
   ```bash
   npm run build
   npm run start &  # Start production server
   sleep 3
   npm run lighthouse  # Run audit
   ```

## Viewing Results

### GitHub PR Comments
- Automated comments on every PR with summary scores
- Click "View detailed report" for full Lighthouse HTML

### Manual Review
Run locally:
```bash
npm run lighthouse      # HTML report
npm run lighthouse:json # JSON format
```

View reports:
```bash
open ./lighthouse/report.html
```

## Performance Targets

Current thresholds for CI to pass:
| Category | Target | Why |
|----------|--------|-----|
| Performance | 75% | FCP/LCP/CLS optimization |
| Accessibility | 85% | WCAG compliance |
| Best Practices | 85% | Security, standards |
| SEO | 85% | Metadata, structured data |

## Environment Notes

- **OS**: Ubuntu Latest
- **Node**: v20
- **Browser**: Chromium (headless)
- **Network**: GitHub-hosted (stable, fair baseline)
- **Throttling**: Desktop (no mobile throttling)

This ensures fair, reproducible results across all PRs.

## Next Steps

1. **Open a PR** - Trigger Lighthouse CI
2. **Review scores** - See performance report comment
3. **Optimize as needed** - Make improvements
4. **Re-push** - New Lighthouse run on each commit
5. **Merge** - Once thresholds are met

## Resources

- [Lighthouse CI Docs](https://github.com/GoogleChrome/lighthouse-ci)
- [Lighthouse Metrics](https://web.dev/metrics/)
- [Web Vitals](https://web.dev/vitals/)
