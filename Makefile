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
		-v `pwd`/certs/prp-s3-credentials:/.aws/credentials \
		--user=`id -u`:`id -g` \
		--entrypoint /bin/bash \
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

publish:
	aws --profile braingeneers-administrator iot-data publish --topic all --qos 1 --payload '{"uuid": "2019-10-03"}'


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

build-console:
	# Build a production minified version of the console web app
	npm run build

run-console:
	# Run the build version locally
	npx serve -s build -l tcp://0.0.0.0:3000

deploy-console:
	# Build and deploy the app via github pages
	npm run build
	npx gh-pages -d build
