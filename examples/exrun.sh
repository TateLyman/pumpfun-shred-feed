cd /root/mm/tmp-ex
KEY=$(curl -s -X POST https://178-105-104-17.sslip.io/api/trial | python3 -c "import sys,json; print(json.load(sys.stdin).get(\"key\",\"\"))")
[ -z "$KEY" ] && { echo "no trial key"; exit 1; }
echo "--- new-coins.mjs (25 s)"
timeout 25 /opt/node/bin/node new-coins.mjs $KEY | head -12
echo "--- race.mjs (90 s)"
timeout 120 /opt/node/bin/node race.mjs $KEY 90
