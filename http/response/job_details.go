package response

import "time"

type JobDetails struct {
	ID               string        `json:"id"`
	URL              string        `json:"url"`
	IsDone           bool          `json:"isDone"`
	CreatedTime      time.Time     `json:"createdTime"`
	ExecutionTime    int           `json:"executionTime"`
	PageResponseTime time.Duration `json:"pageResponseTime"`
	HtmlDocument     HtmlDocument  `json:"htmlDocument"`
	Links            []Link        `json:"linkInformation"`
}

type Link struct {
	URL          string `json:"url"`
	StatusCode   int    `json:"statusCode"`
	IsAccessible bool   `json:"isAccessible"`
	IsInternal   bool   `json:"isInternal"`
	ScanDone     bool   `json:"scanDone"`
}

type HtmlDocument struct {
	Version           string         `json:"version"`
	Title             string         `json:"title"`
	ContainsLoginForm bool           `json:"containsLoginForm"`
	Headings          map[string]int `json:"headings"`
}
