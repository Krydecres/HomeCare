#!/usr/bin/env python3
"""Cách chạy: python scripts/gen-gateway-routes.py docs/backlog/10_API_Contract.csv

Prints the routes block for backend/api-gateway/src/main/resources/application.yml (paste under
spring.cloud.gateway.server.webmvc.routes, indented 10 spaces).

Compute gateway route predicates from 10_API_Contract (Public + Callback paths only, never Internal).

For each contract path, walk its segments ({var} -> *) and stop at the shortest prefix whose whole subtree belongs to
one service: emit '<prefix>/**'. If the path ends before that, emit the exact pattern. Prints YAML routes.
"""
import csv
import re
import sys
from collections import defaultdict

rows = list(csv.reader(open(sys.argv[1], encoding="utf-8")))
paths = []  # (service, segments)
for r in rows[1:]:
    service, kind, path = r[1].strip(), r[2].strip(), r[4].strip()
    if service == "api-gateway" or kind == "Internal" or not path.startswith("/api/v1/"):
        continue
    path = path.split("?")[0].split(" ")[0]
    segs = ["*" if re.fullmatch(r"\{[^}]+\}", s) else s for s in path.strip("/").split("/")]
    paths.append((service, segs))

owners = defaultdict(set)  # prefix tuple -> services in subtree
for service, segs in paths:
    for i in range(1, len(segs) + 1):
        owners[tuple(segs[:i])].add(service)

patterns = defaultdict(set)
conflicts = []
for service, segs in paths:
    for i in range(3, len(segs) + 1):
        prefix = tuple(segs[:i])
        if owners[prefix] == {service}:
            patterns[service].add("/" + "/".join(prefix) + "/**")
            break
    else:
        exact = "/" + "/".join(segs)
        patterns[service].add(exact)
        if len(owners[tuple(segs)]) > 1:
            conflicts.append((exact, owners[tuple(segs)]))


def covered(p, ps):
    """Drop patterns already covered by a broader '/**' of the same service."""
    for q in ps:
        if q != p and q.endswith("/**"):
            base = q[:-3]
            if p == base or p.startswith(base + "/"):
                return True
    return False


order = [
    "identity-service", "customer-service", "caregiver-service", "catalog-service", "booking-service",
    "dispatch-service", "care-record-service", "payment-service", "notification-service", "review-service",
    "incident-service", "report-service",
]
for service in order:
    ps = sorted(p for p in patterns[service] if not covered(p, patterns[service]))
    print(f"        - id: {service}")
    print(f"          uri: lb://{service}")
    print("          predicates:")
    print("            - Path=" + ",".join(ps))
    print("          filters:")
    print("            - TokenRelay=")
    print("            - RemoveRequestHeader=Cookie")
    print("            - RemoveResponseHeader=X-Correlation-Id")
for c in conflicts:
    print("# CONFLICT", c, file=sys.stderr)
