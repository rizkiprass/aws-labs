# AWS Labs

A collection of hands-on AWS labs with CloudFormation templates and code examples. Each lab corresponds to a topic in the [knowledge repo](https://github.com/rizkiprass/knowledge), which contains the full hands-on guides, Medium posts, and LinkedIn posts.

## Structure

```
aws-labs/
└── {topic-slug}/
    ├── README.md                    ← topic overview + setup
    ├── cloudformation/
    │   └── {topic-slug}.yaml        ← one-click deploy template
    └── examples/
        └── (code examples)
```

## Available Labs

| Topic | CloudFormation | Examples | Knowledge Repo |
|-------|---------------|----------|----------------|
| [Amazon SES](./amazon-ses/) | ✅ | ✅ | [knowledge repo](https://github.com/rizkiprass/knowledge/tree/main/topics/amazon-ses) |

## Quick Start

Each lab has two deployment options:

1. **CloudFormation (recommended)** — one-click deploy, no manual steps
2. **Hands-on manual setup** — follow the lab guide in the [knowledge repo](https://github.com/rizkiprass/knowledge) for step-by-step instructions

## Contributing

This is a personal learning lab. New labs are added as topics are processed in the knowledge pipeline.
