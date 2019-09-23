#
# Thing
#

build-thing:
	# Build custom docker image
	docker build . -t $(USER)-braingeneers-thing

debug-thing:
	# Run our image with the local version of the app and shell into it
	docker run -it --rm \
		-v `pwd`:/app \
		--user=`id -u`:`id -g` \
		--entrypoint /bin/sh \
		$(USER)-braingeneers-thing

run-thing:
	# Run the image in a container locally
	docker run -it --rm \
		$(USER)-braingeneers-thing

push-thing:
	# Push our image to dockerhub for running in k8s
	docker tag $(USER)-ubuntu $(DOCKERHUB_ACCOUNT)/ubuntu
	docker push $(DOCKERHUB_ACCOUNT)/ubuntu

list-things:
	aws --profile braingeneers-administrator iot list-things

#
# Console
#

autossh:
	# Port forward to local machine react dev server and ethereum test server
	autossh -M 20000 -N plaza.gi.ucsc.edu -L 18500:localhost:3000

debug-console:
	# Start a local server with dynamic reloading
	# npm start
	docker run --rm -it --name $(USER)-node \
		-v `pwd`:/app \
		-p 127.0.0.1:18500:3000 \
		-w /app \
		-e USER=$(USER) \
		-e HOME=/app \
		--user=`id -u`:`id -g` \
		--entrypoint /bin/bash \
		node:latest
