"""Check the public NetherNet signaling endpoint without player credentials."""
import json
import urllib.request
import urllib.error

for scheme in ("http", "https"):
    url = scheme + "://np.hanasand.com:443/v1/join"
    with urllib.request.urlopen(url, timeout=10) as response:
        data = json.load(response)
    assert "Name Pending" in data["name"], data
    assert data["transportLayer"] == 2 and data["onlineAuth"], data
    print(scheme, "NetherNet:", data["name"], data["version"], data["protocol"])
    request = urllib.request.Request(url + "/codex-auth-check", data=b"invalid-sdp", method="POST")
    try:
        urllib.request.urlopen(request, timeout=10)
        raise AssertionError("Invalid login unexpectedly accepted")
    except urllib.error.HTTPError as error:
        assert error.code in (400, 401, 403), error.code
        print(scheme, "invalid login rejected:", error.code)
print("Signaling checks passed. An authenticated iPad join must verify UDP/WebRTC and gameplay.")
