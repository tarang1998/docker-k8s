import threading
import requests
import time

def send_request(url):
    start_time = time.time()
    try:
        response = requests.get(url)
        latency = time.time() - start_time
        print(f"Status Code: {response.status_code}, Response Time: {latency:.2f} seconds")
    except requests.exceptions.RequestException as e:
        print(f"Request failed: {e}")

def load_test(url, total_requests, concurrent_threads):
    threads = []
    for _ in range(total_requests):
        if len(threads) >= concurrent_threads:
            for t in threads:
                t.join()
            threads = []
        thread = threading.Thread(target=send_request, args=(url,))
        threads.append(thread)
        thread.start()
    for t in threads:
        t.join()


if __name__ == "__main__":
    target_url = "https://tarangnair.com"
    total_requests = 1000000
    concurrent_threads = 1000
    load_test(target_url, total_requests, concurrent_threads)