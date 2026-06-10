# GraphQL Profile Dashboard

A steampunk-themed profile dashboard that authenticates users via JWT and displays personalized school data through GraphQL queries, with interactive SVG-based statistics visualizations.

## Features

### Authentication
- Login with username or email + password
- JWT-based session management
- Secure token storage and validation
- Automatic session recovery on page reload
- Clear logout with session cleanup

### Profile Information
Three information sections showcase key user metrics:
- **Identity**: Login, User ID, and Audit Ratio
- **Performance**: Total XP and transaction count
- **Progress**: Pass/fail counts and pass rate percentage

### Statistics & Visualizations
Three responsive SVG charts provide data storytelling:
1. **XP Progress Over Time** - Cumulative XP line chart with parchment background and brass styling
2. **XP Source Breakdown** - Pie chart showing XP by source (JS Piscine, Go Piscine, Module, Bonus)
3. **Top Group Collaborators** - Horizontal bar chart of most-worked-with teammates

## Tech Stack

- **Frontend**: Vanilla JavaScript (ES6+), HTML5, CSS3
- **Data Visualization**: SVG (custom chart rendering engine)
- **API**: GraphQL with Bearer token authentication
- **Fonts**: Google Fonts (Cinzel, IM Fell English, Special Elite)
- **State Management**: Client-side with localStorage persistence

## Setup

### Prerequisites
- Modern web browser (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+)
- Access to zone01 GraphQL endpoint

### Installation
1. Clone the repository
2. Open `index.html` in your browser or deploy to a static host
3. Update GraphQL endpoints in `js/api.js` if needed

### Login
1. Enter username or email
2. Enter password
3. Click "Sign in"
- Invalid credentials display a styled alert above the form
- Valid login stores JWT and loads profile immediately

### Profile View
After login, displays:
- Logged-in username in centered header
- Three stat cards: Identity, Performance, Progress
- Statistics section with three SVG charts

### Logout
Click "Logout" button in top-right corner to end session and return to login.

## Project Structure

```
graphql/
├── index.html                    # Main HTML
├── styles.css                    # Steampunk theme & responsive styles
├── README.md                     # This file
├── js/
│   ├── main.js                  # Bootstrap & view state
│   ├── api.js                   # GraphQL queries & auth
│   ├── auth.js                  # JWT token handling
│   ├── format.js                # Byte/ratio formatting
│   ├── state.js                 # Global app state
│   ├── charts/
│   │   └── svgCharts.js         # SVG chart rendering
│   └── views/
│       ├── loginView.js         # Login form controller
│       └── profileView.js       # Profile event binding
```

## GraphQL Queries

### Profile & Transactions
Fetches user info, total XP, and individual transactions:
```graphql
query {
  user { id, login, auditRatio }
  transaction_aggregate { aggregate { sum { amount }, count } }
  xp_transactions: transaction { amount, createdAt, event { id }, isBonus }
}
```

### Progress Counts
Aggregate pass/fail counts:
```graphql
query {
  progress_pass: progress_aggregate(where: { grade: { _eq: 1 } }) { aggregate { count } }
  progress_fail: progress_aggregate(where: { grade: { _eq: 0 } }) { aggregate { count } }
}
```

### Group Audits
Nested query for group membership and collaborators:
```graphql
query {
  audit {
    group {
      id
      members { userLogin }
    }
  }
}
```

## Chart Details

### XP Progress Over Time
- **Type**: Line chart with area fill
- **Data**: Cumulative XP over transaction history
- **Visual**: Dark metal bg, parchment plot area, brass axes and gridlines
- **Labels**: Date range at bottom, byte values on Y-axis

### XP Source Breakdown
- **Type**: Pie chart
- **Data**: XP totals grouped by event type
- **Categories**:
  - JS Piscine (event.id = 777)
  - Go Piscine (event.id = 123)
  - Module (all other events)
  - Bonus (isBonus = true)
- **Visual**: Contrast-rich slice colors, parchment panel, legend on right

### Top Group Collaborators
- **Type**: Horizontal bar chart
- **Data**: Count of groups shared with each teammate (top 10)
- **Deduplication**: Only counts each group once
- **Visual**: Teammate names left-aligned, count values inside bars

## Error Handling

| Scenario | Behavior |
|----------|----------|
| Invalid credentials | Red alert box above login form, stays on login |
| Network error | Error message on profile screen |
| Session expired | Redirected to login with "Session expired" message |
| Missing chart data | "No data yet" placeholder in chart area |
| Authorization failure | Profile message displays error, charts remain empty |

## Browser Compatibility

| Browser | Version | Status |
|---------|---------|--------|
| Chrome | 90+ | ✓ Full support |
| Firefox | 88+ | ✓ Full support |
| Safari | 14+ | ✓ Full support |
| Edge | 90+ | ✓ Full support |
| Mobile | All modern | ✓ Responsive |

## Performance Notes

- Charts render on-demand after profile loads
- SVG viewBox adapts to container size
- Token stored in localStorage for session recovery
- No external charting library (custom SVG rendering)

## Accessibility

- ARIA live regions for error messages
- Semantic HTML (headings, forms, sections)
- High-contrast steampunk palette (WCAG AA)
- Keyboard-navigable login form
- Screen reader-friendly chart labels
- Focus indicators on all interactive elements

## Known Limitations

- Chart values depend on accurate GraphQL data
- Group deduplication by ID (requires unique group IDs)
- XP source detection relies on hardcoded event IDs (777, 123)
- No offline support (requires network for queries)

## Future Enhancements

- Dark/light theme toggle
- Export profile as PDF
- Compare stats with classmates
- Customizable chart date ranges
- Real-time notification support

## License

Internal school project. For educational purposes only.

## Support

For issues or questions:
1. Check GraphQL endpoint is reachable
2. Verify JWT token is valid and not expired
3. Review browser console for errors
